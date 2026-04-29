import { config } from './config.js';
import { writer } from './lib/firestore.js';
import { runWorkerSim } from './simulators/worker-simulator.js';
import {
  CHUQUI_CENTER,
  buildCrews,
  buildFleet,
  buildGeofences,
  buildSite,
} from './scenarios/chuquicamata.js';
import { seedDemoUser } from './scenarios/demo-user.js';

async function main(): Promise<void> {
  console.log(
    `\n⛑️  Hela Emulator — site=${config.siteId} fleet=${config.fleetSize} emulators=${config.useEmulators}\n`,
  );

  // 1. Seed escenario (idempotente — usa set({merge:true}) en Firestore).
  const site = buildSite(config.siteId);
  const crews = buildCrews(config.siteId);
  const { workers, helmets } = buildFleet(config.siteId, config.fleetSize);
  const geofences = buildGeofences(config.siteId);

  console.log(`🌱 Seeding demo user (prevencionista@hela.cl)...`);
  await seedDemoUser({
    email: 'prevencionista@hela.cl',
    password: 'demo1234',
    displayName: 'Prevencionista Demo',
    role: 'admin',
    siteIds: [config.siteId],
  });

  console.log(`🌱 Seeding site, ${crews.length} crews, ${workers.length} workers, ${helmets.length} helmets, ${geofences.length} geofences...`);

  await writer.upsertSite(site);
  await Promise.all(crews.map((c) => writer.upsertCrew(c)));
  await Promise.all(workers.map((w) => writer.upsertWorker(w)));
  await Promise.all(helmets.map((h) => writer.upsertHelmet(h)));
  await Promise.all(geofences.map((g) => writer.upsertGeofence(g)));

  console.log('✅ Seed completo. Arrancando simuladores...\n');

  // 2. Arrancar simuladores concurrentes.
  const controller = new AbortController();
  const shutdown = () => {
    console.log('\n🛑 Deteniendo simuladores...');
    controller.abort();
    setTimeout(() => process.exit(0), 500);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  const tasks = workers.map((worker, i) => {
    const helmet = helmets[i]!;
    return runWorkerSim({
      worker,
      helmet,
      siteId: config.siteId,
      siteCenter: CHUQUI_CENTER,
      geofences,
      config,
      signal: controller.signal,
    }).catch((err) => {
      console.error(`❌ Falló simulador de ${worker.id}:`, err);
    });
  });

  await Promise.all(tasks);
}

main().catch((err) => {
  console.error('💥 Emulator crasheó:', err);
  process.exit(1);
});
