'use client';

import { Video, VideoOff } from 'lucide-react';
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

export function WorkerDrawer({ worker, helmet, exposure, onClose }: Props) {
  if (!worker) return null;
  return (
    <aside className="absolute right-0 top-0 bottom-0 w-[380px] bg-surface-elevated border-l border-white/5 shadow-2xl z-20 flex flex-col">
      <header className="p-4 border-b border-white/5 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {worker.firstName} {worker.lastName}
          </h2>
          <p className="text-xs text-slate-400">
            RUT {worker.rut} · {worker.role.replace(/_/g, ' ')} · Turno {worker.shift}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">
          ×
        </button>
      </header>

      <div className="p-4 space-y-4 overflow-y-auto">
        <section className="panel-muted p-3">
          <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Casco</h3>
          {helmet ? (
            <dl className="text-sm grid grid-cols-2 gap-y-1">
              <dt className="text-slate-400">Modelo</dt>
              <dd>{helmet.model}</dd>
              <dt className="text-slate-400">Serie</dt>
              <dd className="font-mono text-xs">{helmet.serialNumber}</dd>
              <dt className="text-slate-400">Batería</dt>
              <dd>{helmet.lastBatteryPct != null ? `${Math.round(helmet.lastBatteryPct)}%` : '—'}</dd>
              <dt className="text-slate-400">Señal</dt>
              <dd>{helmet.lastSignalDbm != null ? `${helmet.lastSignalDbm} dBm` : '—'}</dd>
              <dt className="text-slate-400">Conectividad</dt>
              <dd>{helmet.connectivity}</dd>
              <dt className="text-slate-400">Última señal</dt>
              <dd>{helmet.lastSeenAt ? relativeTime(helmet.lastSeenAt) : '—'}</dd>
            </dl>
          ) : (
            <p className="text-sm text-slate-400">Sin casco asignado.</p>
          )}
        </section>

        <section className="panel-muted p-3">
          <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">
            Exposición ocupacional (últimos 7 días)
          </h3>
          <ExposureBar data={exposure} />
        </section>

        <section className="panel-muted p-3">
          <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Cámara</h3>
          {helmet ? <CameraPreview helmet={helmet} /> : null}
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

      {online && (
        <span className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] font-semibold text-severity-critical uppercase tracking-wide">
          <span className="w-1 h-1 rounded-full bg-severity-critical animate-pulse" />
          En vivo
        </span>
      )}

      <span className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] font-mono text-white">
        {helmet.model}
      </span>
    </div>
  );
}
