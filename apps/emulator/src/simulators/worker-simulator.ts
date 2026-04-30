import type {
  Alert,
  AlertType,
  Geofence,
  Helmet,
  Photo,
  TelemetrySample,
  Worker,
} from '@hela/contracts';
import { writer } from '../lib/firestore.js';
import { coin, pick, pointInPolygon, rand, walk } from '../lib/random.js';
import type { EmulatorConfig } from '../config.js';

/**
 * Estado mutable de un trabajador/casco simulado. Un solo ciclo maneja
 * telemetría + foto + alertas + drenaje de batería. Se detiene vía AbortSignal.
 */
export interface WorkerSimDeps {
  worker: Worker;
  helmet: Helmet;
  siteId: string;
  siteCenter: { lat: number; lng: number };
  geofences: Geofence[];
  config: EmulatorConfig;
  signal: AbortSignal;
}

export async function runWorkerSim(deps: WorkerSimDeps): Promise<void> {
  const { worker, helmet, siteId, siteCenter, geofences, config, signal } = deps;

  let lat = siteCenter.lat + rand(-0.015, 0.015);
  let lng = siteCenter.lng + rand(-0.02, 0.02);
  let heading = rand(0, 360);
  let battery = helmet.lastBatteryPct ?? rand(60, 100);
  let lastPhotoAt = Date.now();
  let capOn = true;

  // Identificador único por alerta — combina helmet + epoch.
  let alertSeq = 0;
  const alertId = (type: AlertType) =>
    `a-${helmet.id}-${Date.now()}-${alertSeq++}-${type.toLowerCase()}`;

  // Lazo principal de telemetría.
  while (!signal.aborted) {
    const ts = new Date().toISOString();
    const dtSec = config.telemetryIntervalMs / 1000;

    // Velocidad realista: entre detenido y caminar rápido (0..2 m/s); ocasional trote.
    const speedMps = coin(0.1) ? rand(1.8, 3.0) : rand(0, 1.2);
    ({ lat, lng, headingDeg: heading } = walk(lat, lng, heading, speedMps, dtSec));

    // Mantener dentro del bounding box del site.
    lat = Math.max(siteCenter.lat - 0.03, Math.min(siteCenter.lat + 0.03, lat));
    lng = Math.max(siteCenter.lng - 0.03, Math.min(siteCenter.lng + 0.03, lng));

    // Drenaje lento de batería (~1% cada 2 min simulados).
    battery = Math.max(5, battery - dtSec / 120);

    const sample: TelemetrySample = {
      helmetId: helmet.id,
      workerId: worker.id,
      timestamp: ts,
      position: { lat, lng },
      accuracyM: rand(3, 15),
      altitudeM: 2800 + rand(-50, 50), // Chuquicamata ~2.870 m
      headingDeg: heading,
      speedMps,
      batteryPct: Math.round(battery * 10) / 10,
      signalDbm: Math.round(rand(-95, -65)),
      accelG: 1 + rand(-0.05, 0.05),
      tempC: rand(15, 35),
      capOn,
    };

    await writer.appendTelemetry(sample);
    await writer.updateHelmetLastSeen(helmet.id, {
      lastBatteryPct: sample.batteryPct,
      lastSignalDbm: sample.signalDbm,
      lastSeenAt: ts,
      connectivity: battery < 15 ? 'degraded' : 'online',
    });

    // --- Eventos aleatorios -------------------------------------------------

    // Foto periódica.
    if (Date.now() - lastPhotoAt > config.photoIntervalMs) {
      lastPhotoAt = Date.now();
      await emitPhoto(worker, helmet, siteId, { lat, lng }, ts, 'scheduled');
    }

    // Batería baja → alerta.
    if (battery < 20 && coin(0.05)) {
      await writer.createAlert(
        buildAlert(alertId('LOW_BATTERY'), 'LOW_BATTERY', 'medium', {
          worker,
          helmet,
          siteId,
          ts,
          position: { lat, lng },
          message: `Casco ${helmet.serialNumber} con batería ${sample.batteryPct}%`,
          metadata: { batteryPct: sample.batteryPct },
        }),
      );
    }

    // Geocerca restringida → alerta si entra.
    for (const gf of geofences) {
      if (gf.category !== 'restricted') continue;
      if (pointInPolygon({ lat, lng }, gf.polygon) && coin(0.3)) {
        await writer.createAlert(
          buildAlert(alertId('GEOFENCE_ENTER'), 'GEOFENCE_ENTER', gf.severity, {
            worker,
            helmet,
            siteId,
            ts,
            position: { lat, lng },
            message: `${worker.firstName} ${worker.lastName} entró a zona restringida "${gf.name}"`,
            metadata: { geofenceId: gf.id },
          }),
        );
      }
    }

    // Evento raro pero crítico: SOS / caída / casco fuera.
    if (coin(config.alertProbability)) {
      const type = pick(['SOS', 'FALL', 'CAP_OFF', 'HIGH_VOLTAGE'] as const);
      const severity = type === 'SOS' || type === 'FALL' ? 'critical' : 'high';
      const msg: Record<typeof type, string> = {
        SOS: `${worker.firstName} ${worker.lastName} activó SOS`,
        FALL: `Posible caída detectada: ${worker.firstName} ${worker.lastName}`,
        CAP_OFF: `Casco fuera de cabeza: ${worker.firstName} ${worker.lastName}`,
        HIGH_VOLTAGE: `Proximidad a alta tensión detectada — ${worker.firstName} ${worker.lastName}`,
      };
      if (type === 'CAP_OFF') capOn = false;
      await writer.createAlert(
        buildAlert(alertId(type), type, severity, {
          worker,
          helmet,
          siteId,
          ts,
          position: { lat, lng },
          message: msg[type],
          metadata: {},
        }),
      );
      // Foto automática adjunta al evento.
      if (type === 'SOS' || type === 'FALL') {
        await emitPhoto(worker, helmet, siteId, { lat, lng }, ts, 'alert');
      }
    }

    // Recomponer casco puesto a los ~30s si se cayó.
    if (!capOn && coin(0.05)) capOn = true;

    await sleep(config.telemetryIntervalMs, signal);
  }
}

function buildAlert(
  id: string,
  type: AlertType,
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical',
  ctx: {
    worker: Worker;
    helmet: Helmet;
    siteId: string;
    ts: string;
    position: { lat: number; lng: number };
    message: string;
    metadata: Record<string, unknown>;
  },
): Alert {
  return {
    id,
    type,
    severity,
    status: 'open',
    siteId: ctx.siteId,
    helmetId: ctx.helmet.id,
    workerId: ctx.worker.id,
    occurredAt: ctx.ts,
    position: ctx.position,
    message: ctx.message,
    metadata: ctx.metadata,
    acknowledgedByUserId: null,
    acknowledgedAt: null,
    resolvedByUserId: null,
    resolvedAt: null,
    resolutionNotes: null,
    createdAt: ctx.ts,
    updatedAt: ctx.ts,
  };
}

async function emitPhoto(
  worker: Worker,
  helmet: Helmet,
  siteId: string,
  position: { lat: number; lng: number },
  ts: string,
  source: 'manual' | 'alert' | 'scheduled' | 'supervisor',
): Promise<void> {
  const id = `p-${helmet.id}-${Date.now()}`;
  const storagePath = `photos/${siteId}/${worker.id}/${id}.jpg`;
  const photo: Photo = {
    id,
    helmetId: helmet.id,
    workerId: worker.id,
    siteId,
    takenAt: ts,
    source,
    storagePath,
    thumbnailPath: null,
    position,
    widthPx: 1920,
    heightPx: 1080,
    sizeBytes: null,
    relatedAlertId: null,
    createdAt: ts,
    updatedAt: ts,
  };
  await writer.createPhoto(photo);
  // NOTA: por ahora no subimos bytes reales. Cuando conectemos el H1/H8,
  // el SDK subirá el JPEG y esta función solo registra el metadato.
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(t);
      resolve();
    });
  });
}
