'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  MessageCircle,
  Mic,
  Video,
  VideoOff,
  Volume2,
} from 'lucide-react';
import clsx from 'clsx';
import type { Helmet, Worker } from '@hela/contracts';
import { getDemoVideoUrlForHelmet } from '@/lib/demo-video';
import { relativeTime } from '@/lib/format';
import { useAppData } from '../layout';

const TRANSITION_MS = 320;

export default function CamerasPage() {
  const { workers, helmetsById, contentLeftOffset } = useAppData();

  const feeds = useMemo(() => {
    return workers
      .filter((w) => w.assignedHelmetId)
      .map((w) => ({
        worker: w,
        helmet: helmetsById.get(w.assignedHelmetId!),
      }))
      .filter((f): f is { worker: Worker; helmet: Helmet } => !!f.helmet);
  }, [workers, helmetsById]);

  const onlineCount = feeds.filter((f) => f.helmet.connectivity === 'online').length;

  const [expandedHelmetId, setExpandedHelmetId] = useState<string | null>(null);
  // Keep the last feed mounted while the expanded view fades out, so the user
  // sees a smooth crossfade instead of an abrupt swap.
  const [lingeringFeed, setLingeringFeed] = useState<{ worker: Worker; helmet: Helmet } | null>(
    null,
  );

  useEffect(() => {
    if (expandedHelmetId) {
      const f = feeds.find((x) => x.helmet.id === expandedHelmetId);
      if (f) setLingeringFeed(f);
      return;
    }
    if (!lingeringFeed) return;
    const t = setTimeout(() => setLingeringFeed(null), TRANSITION_MS);
    return () => clearTimeout(t);
  }, [expandedHelmetId, feeds, lingeringFeed]);

  const isExpanded = !!expandedHelmetId;

  // Cerrar con ESC.
  useEffect(() => {
    if (!expandedHelmetId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedHelmetId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expandedHelmetId]);

  return (
    <div className="relative flex-1 min-h-0">
      {/* One wide floating glass card containing every camera */}
      <section
        style={{ left: contentLeftOffset, transition: 'left 200ms ease-out' }}
        className="absolute top-4 right-4 bottom-4 z-10 flex flex-col rounded-2xl border border-white/40 bg-white/20 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,0,0,0.18)] overflow-hidden pointer-events-auto"
      >
        {/* Header — both variants stack and crossfade */}
        <div className="relative shrink-0 h-[72px] border-b border-white/40">
          <header
            className={clsx(
              'absolute inset-0 flex items-center justify-between px-6 transition-opacity ease-out',
              isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100',
            )}
            style={{ transitionDuration: `${TRANSITION_MS}ms` }}
          >
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">Cámaras en vivo</h1>
              <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-700 mt-0.5">
                {onlineCount} de {feeds.length} en línea
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Transmisión en tiempo real</span>
            </div>
          </header>

          {lingeringFeed && (
            <div
              className={clsx(
                'absolute inset-0 transition-opacity ease-out',
                isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none',
              )}
              style={{ transitionDuration: `${TRANSITION_MS}ms` }}
            >
              <ExpandedHeader
                worker={lingeringFeed.worker}
                helmet={lingeringFeed.helmet}
                onBack={() => setExpandedHelmetId(null)}
              />
            </div>
          )}
        </div>

        {/* Body — both variants stack and crossfade */}
        <div className="relative flex-1 min-h-0">
          <div
            className={clsx(
              'absolute inset-0 overflow-y-auto p-5 transition-opacity ease-out',
              isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100',
            )}
            style={{ transitionDuration: `${TRANSITION_MS}ms` }}
          >
            {feeds.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-neutral-700">
                Sin cámaras disponibles.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {feeds.map(({ worker, helmet }) => (
                  <CameraTile
                    key={helmet.id}
                    worker={worker}
                    helmet={helmet}
                    onExpand={() => setExpandedHelmetId(helmet.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {lingeringFeed && (
            <div
              className={clsx(
                'absolute inset-0 transition-[opacity,transform] ease-out origin-center',
                isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97] pointer-events-none',
              )}
              style={{ transitionDuration: `${TRANSITION_MS}ms` }}
            >
              <ExpandedBody worker={lingeringFeed.worker} helmet={lingeringFeed.helmet} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ExpandedHeader({
  worker,
  helmet,
  onBack,
}: {
  worker: Worker;
  helmet: Helmet;
  onBack: () => void;
}) {
  return (
    <header className="h-full flex items-center justify-between gap-4 px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBack}
          aria-label="Volver a la grilla"
          className="w-9 h-9 shrink-0 rounded-full bg-white/30 hover:bg-white/50 border border-white/40 flex items-center justify-center text-neutral-900 transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-neutral-900 truncate">
            {worker.firstName} {worker.lastName}
          </h1>
          <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-700 mt-0.5 truncate">
            {worker.role.replace(/_/g, ' ')} · Turno {worker.shift} · Casco {helmet.model} · {helmet.serialNumber}
          </p>
        </div>
      </div>
      <div className="text-right text-[11px] text-neutral-700 shrink-0">
        <p>Batería {helmet.lastBatteryPct != null ? `${Math.round(helmet.lastBatteryPct)}%` : '—'}</p>
        <p>{helmet.lastSeenAt ? relativeTime(helmet.lastSeenAt) : 'sin señal'}</p>
      </div>
    </header>
  );
}

function ExpandedBody({ worker: _worker, helmet }: { worker: Worker; helmet: Helmet }) {
  const online = helmet.connectivity === 'online';
  const videoUrl = online ? getDemoVideoUrlForHelmet(helmet.id) : null;
  return (
    <div className="h-full flex flex-col">
      {/* Big video */}
      <div className="flex-1 min-h-0 px-6 pt-5 pb-4 flex items-center justify-center">
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-black ring-1 ring-black/20">
          {online ? (
            videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
                <Video size={64} className="text-slate-700" />
              </div>
            )
          ) : (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-500">
              <VideoOff size={48} />
              <p className="text-sm">Sin señal</p>
            </div>
          )}

          <span
            className={clsx(
              'absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded bg-black/60 backdrop-blur text-xs font-semibold uppercase tracking-wide',
              online ? 'text-brand-500' : 'text-severity-critical',
            )}
          >
            <span
              className={clsx(
                'w-2 h-2 rounded-full',
                online ? 'bg-brand-500 animate-pulse' : 'bg-severity-critical',
              )}
            />
            {online ? 'En vivo' : 'Desconectado'}
          </span>

          <span className="absolute top-4 right-4 px-2 py-1 rounded bg-black/60 backdrop-blur text-xs font-mono text-white">
            {helmet.model}
          </span>
        </div>
      </div>

      {/* Action bar — placeholders. Funcionales cuando llegue el hardware + MediaMTX. */}
      <div className="shrink-0 flex items-center justify-center gap-3 pb-5">
        <ActionButton icon={Mic} label="Hablar (PTT)" />
        <ActionButton icon={Volume2} label="Escuchar" />
        <ActionButton icon={Camera} label="Capturar foto" />
        <ActionButton icon={MessageCircle} label="Enviar mensaje" />
      </div>
    </div>
  );
}

interface TileProps {
  worker: Worker;
  helmet: Helmet;
  onExpand: () => void;
}

function CameraTile({ worker, helmet, onExpand }: TileProps) {
  const online = helmet.connectivity === 'online';
  const videoUrl = online ? getDemoVideoUrlForHelmet(helmet.id) : null;
  return (
    <article
      onClick={onExpand}
      className="bg-white/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 rounded-xl overflow-hidden flex flex-col cursor-pointer hover:ring-2 hover:ring-brand-500/50 transition"
    >
      <div className="relative aspect-video bg-black flex items-center justify-center">
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
              <Video size={32} className="text-slate-600" />
            </div>
          )
        ) : (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-2 text-slate-500">
            <VideoOff size={28} />
            <p className="text-xs">Sin señal</p>
          </div>
        )}

        <span
          className={clsx(
            'absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] font-semibold uppercase tracking-wide',
            online ? 'text-brand-500' : 'text-severity-critical',
          )}
        >
          <span
            className={clsx(
              'w-1.5 h-1.5 rounded-full',
              online ? 'bg-brand-500 animate-pulse' : 'bg-severity-critical',
            )}
          />
          {online ? 'En vivo' : 'Desconectado'}
        </span>

        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] font-mono text-white">
          {helmet.model}
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate text-neutral-900">
              {worker.firstName} {worker.lastName}
            </p>
            <p className="text-[11px] text-neutral-700 truncate">
              {worker.role.replace(/_/g, ' ')} · Turno {worker.shift}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-neutral-900">
              {helmet.lastBatteryPct != null ? `${Math.round(helmet.lastBatteryPct)}%` : '—'}
            </p>
            <p className="text-[10px] text-neutral-700">
              {helmet.lastSeenAt ? relativeTime(helmet.lastSeenAt) : 'sin señal'}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function ActionButton({
  icon: Icon,
  label,
}: {
  icon: typeof Mic;
  label: string;
}) {
  return (
    <button
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 hover:bg-white/50 border border-white/40 text-sm text-neutral-900 transition"
      title={label}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}
