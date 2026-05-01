'use client';

import { useState } from 'react';
import { AlertOctagon } from 'lucide-react';
import { AlertsPanel } from '@/components/alerts-panel';
import { AlertsByTypeChart } from '@/components/charts/alerts-by-type';
import { WorkersList } from '@/components/workers-list';
import { getDataAccess } from '@/lib/data-access';
import { useAppData } from '../layout';

export default function DashboardPage() {
  const da = getDataAccess();
  const {
    siteId,
    positions,
    workers,
    helmets,
    helmetsById,
    openAlerts,
    recentAlerts,
    selectedHelmetId,
    setSelectedHelmetId,
    selectedWorker,
    contentLeftOffset,
  } = useAppData();

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
    <div className="relative flex-1 min-h-0">
      {/* Floating top header pill */}
      <header
        style={{ left: contentLeftOffset, transition: 'left 200ms ease-out' }}
        className="absolute top-4 right-[396px] z-10 h-14 flex items-center justify-between px-5 rounded-2xl border border-white/40 bg-white/20 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,0,0,0.18)] pointer-events-auto"
      >
        <div>
          <h1 className="text-base font-semibold text-neutral-900">Panel General</h1>
          <p className="text-[11px] text-neutral-700">Site: {siteId}</p>
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
          <div className="flex items-center gap-2 text-xs text-neutral-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>En vivo</span>
          </div>
        </div>
      </header>

      {/* Floating left rail: workers + open alerts */}
      <aside
        style={{ left: contentLeftOffset, transition: 'left 200ms ease-out' }}
        className="absolute top-[88px] bottom-4 w-72 z-10 flex flex-col rounded-2xl border border-white/40 bg-white/20 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,0,0,0.18)] overflow-hidden pointer-events-auto"
      >
        <section className="flex-1 min-h-0 flex flex-col">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-neutral-700 border-b border-white/40">
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
        <section className="border-t border-white/40 max-h-[40%] flex flex-col">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-neutral-700 border-b border-white/40">
            Alertas abiertas · {openAlerts.length}
          </div>
          <div className="flex-1 overflow-y-auto">
            <AlertsPanel alerts={openAlerts} onSelect={(a) => setSelectedHelmetId(a.helmetId)} />
          </div>
        </section>
      </aside>

      {/* Floating right rail: alerts chart + KPIs (hidden when drawer is open) */}
      {!selectedWorker && (
        <aside className="absolute right-4 top-4 bottom-4 w-80 z-10 flex flex-col rounded-2xl border border-white/40 bg-white/20 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,0,0,0.18)] overflow-hidden pointer-events-auto">
          <section className="p-3 border-b border-white/40">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-700 mb-2">
              Alertas por tipo (recientes)
            </h3>
            <AlertsByTypeChart alerts={recentAlerts} />
          </section>
          <section className="p-3">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-700 mb-2">
              KPIs del turno
            </h3>
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
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 rounded-xl p-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-700">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900">{value}</p>
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
