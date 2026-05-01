'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Video, VideoOff, X } from 'lucide-react';
import type { Helmet, Worker } from '@hela/contracts';
import { ExposureBar, type ExposureBarDatum } from './charts/exposure-bar';
import { getDemoVideoUrlForHelmet } from '@/lib/demo-video';
import { relativeTime } from '@/lib/format';

interface Props {
  worker: Worker | null;
  helmet: Helmet | null;
  exposure: ExposureBarDatum[];
  onClose: () => void;
}

const TRANSITION_MS = 320;

export function WorkerDrawer({ worker, helmet, exposure, onClose }: Props) {
  // Keep the last props rendered while we animate out, so closing fades the
  // drawer instead of unmounting it instantly.
  const [rendered, setRendered] = useState<{
    worker: Worker;
    helmet: Helmet | null;
    exposure: ExposureBarDatum[];
  } | null>(null);
  // `visible` controls the open/closed CSS state; `rendered` controls mounting.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (worker) {
      setRendered({ worker, helmet, exposure });
      // Double rAF: the first frame commits the *closed* state to the DOM and
      // lets the browser paint it; the second frame flips to open, so the CSS
      // transition has two distinct paints to interpolate between.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        if (inner) cancelAnimationFrame(inner);
      };
    }
    setVisible(false);
    const t = setTimeout(() => setRendered(null), TRANSITION_MS);
    return () => clearTimeout(t);
  }, [worker, helmet, exposure]);

  if (!rendered) return null;

  const r = rendered;
  return (
    <aside
      className={clsx(
        'absolute right-4 top-4 bottom-4 w-[380px] bg-white/20 border border-white/40 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-20 flex flex-col overflow-hidden ease-out',
        visible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-4 pointer-events-none',
      )}
      style={{ transitionProperty: 'opacity, transform', transitionDuration: `${TRANSITION_MS}ms` }}
    >
      <header className="p-4 border-b border-white/40 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-neutral-900 truncate">
            {r.worker.firstName} {r.worker.lastName}
          </h2>
          <p className="text-xs text-neutral-700 truncate">
            RUT {r.worker.rut} · {r.worker.role.replace(/_/g, ' ')} · Turno {r.worker.shift}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="w-9 h-9 shrink-0 rounded-full bg-white/30 hover:bg-white/50 border border-white/40 flex items-center justify-center text-neutral-900 transition"
        >
          <X size={16} />
        </button>
      </header>

      <div className="p-4 space-y-4 overflow-y-auto">
        <section className="bg-white/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 rounded-xl p-3">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-700 mb-2">Casco</h3>
          {r.helmet ? (
            <dl className="text-sm grid grid-cols-2 gap-y-1 text-neutral-900">
              <dt className="text-neutral-600">Modelo</dt>
              <dd>{r.helmet.model}</dd>
              <dt className="text-neutral-600">Serie</dt>
              <dd className="font-mono text-xs">{r.helmet.serialNumber}</dd>
              <dt className="text-neutral-600">Batería</dt>
              <dd>{r.helmet.lastBatteryPct != null ? `${Math.round(r.helmet.lastBatteryPct)}%` : '—'}</dd>
              <dt className="text-neutral-600">Señal</dt>
              <dd>{r.helmet.lastSignalDbm != null ? `${r.helmet.lastSignalDbm} dBm` : '—'}</dd>
              <dt className="text-neutral-600">Conectividad</dt>
              <dd>{r.helmet.connectivity}</dd>
              <dt className="text-neutral-600">Última señal</dt>
              <dd>{r.helmet.lastSeenAt ? relativeTime(r.helmet.lastSeenAt) : '—'}</dd>
            </dl>
          ) : (
            <p className="text-sm text-neutral-600">Sin casco asignado.</p>
          )}
        </section>

        <section className="bg-white/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 rounded-xl p-3">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-700 mb-2">
            Exposición ocupacional (últimos 7 días)
          </h3>
          <ExposureBar data={r.exposure} />
        </section>

        <section className="bg-white/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 rounded-xl p-3">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-700 mb-2">Cámara</h3>
          {r.helmet ? <CameraPreview helmet={r.helmet} /> : null}
        </section>
      </div>
    </aside>
  );
}

function CameraPreview({ helmet }: { helmet: Helmet }) {
  const online = helmet.connectivity === 'online';
  const videoUrl = online ? getDemoVideoUrlForHelmet(helmet.id) : null;
  return (
    <div className="relative aspect-video rounded overflow-hidden bg-black">
      {online ? (
        videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
            <Video size={24} className="text-slate-600" />
          </div>
        )
      ) : (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-1 text-slate-500">
          <VideoOff size={20} />
          <p className="text-[10px]">Sin señal</p>
        </div>
      )}

      <span
        className={`absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] font-semibold uppercase tracking-wide ${
          online ? 'text-brand-500' : 'text-severity-critical'
        }`}
      >
        <span
          className={`w-1 h-1 rounded-full ${
            online ? 'bg-brand-500 animate-pulse' : 'bg-severity-critical'
          }`}
        />
        {online ? 'En vivo' : 'Desconectado'}
      </span>

      <span className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] font-mono text-white">
        {helmet.model}
      </span>
    </div>
  );
}
