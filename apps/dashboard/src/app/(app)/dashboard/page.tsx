'use client';

import { useMemo, useState } from 'react';
import { AlertOctagon } from 'lucide-react';
import type { Alert, Geofence, Helmet, Worker } from '@hela/contracts';
import type { LivePosition } from '@hela/data-access';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentSiteId } from '@/hooks/use-site';
import { useSubscribable } from '@/hooks/use-subscribable';
import { getDataAccess } from '@/lib/data-access';
import { AlertsPanel } from '@/components/alerts-panel';
import { AlertsByTypeChart } from '@/components/charts/alerts-by-type';
import { MapView } from '@/components/map-view';
import { WorkerDrawer } from '@/components/worker-drawer';
import { WorkersList } from '@/components/workers-list';
import { CHUQUI_CENTER } from './_site-defaults';
import type { ExposureBarDatum } from '@/components/charts/exposure-bar';

export default function DashboardPage() {
  const { user } = useAuth();
  const siteId = useCurrentSiteId();
  const da = getDataAccess();
  const [selectedHelmetId, setSelectedHelmetId] = useState<string | null>(null);

  const userKey = user?.uid ?? '';

  const { value: positions } = useSubscribable<LivePosition[]>(
    () => (user ? da.telemetry.watchLivePositions(siteId) : null),
    [userKey, siteId],
    [],
  );
  const { value: workers } = useSubscribable<Worker[]>(
    () => (user ? da.workers.watchActiveBySite(siteId) : null),
    [userKey, siteId],
    [],
  );
  const { value: helmets } = useSubscribable<Helmet[]>(
    () => (user ? da.helmets.watchBySite(siteId) : null),
    [userKey, siteId],
    [],
  );
  const { value: geofences } = useSubscribable<Geofence[]>(
    () => (user ? da.geofences.watchBySite(siteId) : null),
    [userKey, siteId],
    [],
  );
  const { value: openAlerts } = useSubscribable<Alert[]>(
    () => (user ? da.alerts.watchOpenBySite(siteId) : null),
    [userKey, siteId],
    [],
  );
  const { value: recentAlerts } = useSubscribable<Alert[]>(
    () => (user ? da.alerts.watchRecentBySite(siteId, 200) : null),
    [userKey, siteId],
    [],
  );

  const helmetsById = useMemo(() => new Map(helmets.map((h) => [h.id, h])), [helmets]);
  const workerByHelmetId = useMemo(
    () =>
      new Map(
        workers
          .filter((w): w is Worker & { assignedHelmetId: string } => !!w.assignedHelmetId)
          .map((w) => [w.assignedHelmetId, w]),
      ),
    [workers],
  );

  const selectedHelmet = selectedHelmetId ? helmetsById.get(selectedHelmetId) ?? null : null;
  const selectedWorker = selectedHelmetId ? workerByHelmetId.get(selectedHelmetId) ?? null : null;

  const exposureDemo: ExposureBarDatum[] = useMemo(() => {
    if (!selectedWorker) return [];
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const seed = selectedWorker.id.length;
    return days.map((label, i) => ({
      label,
      polvo: (seed * 17 + i * 23) % 120,
      ruido: (seed * 7 + i * 11) % 90,
      altura: (seed * 3 + i * 5) % 40,
      alta_tension: (seed + i) % 20,
    }));
  }, [selectedWorker]);

  const [simulating, setSimulating] = useState(false);

  async function simulateSOS() {
    if (simulating) return;
    if (positions.length === 0) return;
    setSimulating(true);
    try {
      const random = positions[Math.floor(Math.random() * positions.length)]!;
      const worker = workers.find((w) => w.assignedHelmetId === random.helmetId);
      const now = new Date().toISOString();
      const id = `a-demo-${Date.now()}`;
      await da.alerts.create({
        id,
        type: 'SOS',
        severity: 'critical',
        status: 'open',
        siteId,
        helmetId: random.helmetId,
        workerId: random.workerId,
        occurredAt: now,
        position: { lat: random.lat, lng: random.lng },
        message: worker
          ? `${worker.firstName} ${worker.lastName} activó SOS`
          : 'Trabajador activó SOS',
        metadata: { demo: true },
        acknowledgedByUserId: null,
        acknowledgedAt: null,
        resolvedByUserId: null,
        resolvedAt: null,
        resolutionNotes: null,
        createdAt: now,
        updatedAt: now,
      });
      // Seleccionar el casco para que el drawer + pin del mapa destaquen al tiro.
      setSelectedHelmetId(random.helmetId);
      playBeep();
    } finally {
      setSimulating(false);
    }
  }

  return (
    <>
      <header className="h-14 shrink-0 border-b border-white/5 flex items-center justify-between px-5">
        <div>
          <h1 className="text-base font-semibold">Panel General</h1>
          <p className="text-[11px] text-slate-400">Site: {siteId}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={simulateSOS}
            disabled={simulating || positions.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-severity-critical/90 hover:bg-severity-critical text-white text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertOctagon size={14} />
            {simulating ? 'Enviando…' : 'Simular SOS'}
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>En vivo</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-72 shrink-0 border-r border-white/5 flex flex-col">
          <section className="flex-1 min-h-0 flex flex-col">
            <div className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 border-b border-white/5">
              Trabajadores activos · {workers.length}
            </div>
            <div className="flex-1 overflow-y-auto">
              <WorkersList
                workers={workers}
                helmetsById={helmetsById}
                selectedHelmetId={selectedHelmetId}
                onSelect={setSelectedHelmetId}
              />
            </div>
          </section>
          <section className="border-t border-white/5 max-h-[40%] flex flex-col">
            <div className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 border-b border-white/5">
              Alertas abiertas · {openAlerts.length}
            </div>
            <div className="flex-1 overflow-y-auto">
              <AlertsPanel alerts={openAlerts} onSelect={(a) => setSelectedHelmetId(a.helmetId)} />
            </div>
          </section>
        </aside>

        <div className="flex-1 relative">
          <MapView
            center={CHUQUI_CENTER}
            zoom={13}
            positions={positions}
            geofences={geofences}
            selectedHelmetId={selectedHelmetId}
            onSelectHelmet={setSelectedHelmetId}
          />
          <WorkerDrawer
            worker={selectedWorker}
            helmet={selectedHelmet}
            exposure={exposureDemo}
            onClose={() => setSelectedHelmetId(null)}
          />
        </div>

        <aside className="w-80 shrink-0 border-l border-white/5 flex flex-col">
          <section className="p-3 border-b border-white/5">
            <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              Alertas por tipo (recientes)
            </h3>
            <AlertsByTypeChart alerts={recentAlerts} />
          </section>
          <section className="p-3 border-b border-white/5">
            <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">KPIs del turno</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <KpiCard label="Trabajadores" value={workers.length} />
              <KpiCard label="Alertas abiertas" value={openAlerts.length} />
              <KpiCard
                label="Cascos online"
                value={helmets.filter((h) => h.connectivity === 'online').length}
              />
              <KpiCard
                label="Batería <20%"
                value={helmets.filter((h) => (h.lastBatteryPct ?? 100) < 20).length}
              />
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel-muted p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

/**
 * Beep corto vía Web Audio API. Se evita subir un asset de audio para no
 * inflar el bundle. El tono es deliberadamente discreto (no asusta en demo)
 * pero audible para llamar la atención del prevencionista.
 */
function playBeep(): void {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => ctx.close();
  } catch {
    /* si falla por política de autoplay, silencioso */
  }
}
