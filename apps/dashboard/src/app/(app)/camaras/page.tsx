'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  MessageCircle,
  Mic,
  Video,
  VideoOff,
  Volume2,
  X,
} from 'lucide-react';
import type { Helmet, Worker } from '@hela/contracts';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentSiteId } from '@/hooks/use-site';
import { useSubscribable } from '@/hooks/use-subscribable';
import { getDataAccess } from '@/lib/data-access';
import { getDemoVideoUrlForHelmet } from '@/lib/demo-video';
import { relativeTime } from '@/lib/format';

export default function CamerasPage() {
  const { user } = useAuth();
  const siteId = useCurrentSiteId();
  const da = getDataAccess();
  const userKey = user?.uid ?? '';

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

  const helmetsById = useMemo(() => new Map(helmets.map((h) => [h.id, h])), [helmets]);

  const feeds = useMemo(() => {
    return workers
      .filter((w) => w.assignedHelmetId)
      .map((w) => ({
        worker: w,
        helmet: helmetsById.get(w.assignedHelmetId!),
      }))
      .filter((f): f is { worker: Worker; helmet: Helmet } => !!f.helmet);
  }, [workers, helmetsById]);

  const [expandedHelmetId, setExpandedHelmetId] = useState<string | null>(null);
  const expanded = expandedHelmetId ? feeds.find((f) => f.helmet.id === expandedHelmetId) : null;

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
    <>
      <div className="flex-1 overflow-y-auto p-5">
        {feeds.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
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

      {expanded && (
        <ExpandedFeed
          worker={expanded.worker}
          helmet={expanded.helmet}
          onClose={() => setExpandedHelmetId(null)}
        />
      )}
    </>
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
      className="panel overflow-hidden flex flex-col cursor-pointer hover:ring-2 hover:ring-brand-500/40 transition"
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

        {online && (
          <span className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] font-semibold text-severity-critical uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-severity-critical animate-pulse" />
            En vivo
          </span>
        )}

        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] font-mono text-white">
          {helmet.model}
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {worker.firstName} {worker.lastName}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {worker.role.replace(/_/g, ' ')} · Turno {worker.shift}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-300">
              {helmet.lastBatteryPct != null ? `${Math.round(helmet.lastBatteryPct)}%` : '—'}
            </p>
            <p className="text-[10px] text-slate-500">
              {helmet.lastSeenAt ? relativeTime(helmet.lastSeenAt) : 'sin señal'}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

interface ExpandedProps {
  worker: Worker;
  helmet: Helmet;
  onClose: () => void;
}

function ExpandedFeed({ worker, helmet, onClose }: ExpandedProps) {
  const online = helmet.connectivity === 'online';
  const videoUrl = online ? getDemoVideoUrlForHelmet(helmet.id) : null;
  return (
    <div
      className="absolute inset-0 z-40 bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <header
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-base font-semibold">
            {worker.firstName.slice(0, 1)}
            {worker.lastName.slice(0, 1)}
          </div>
          <div>
            <p className="text-base font-medium">
              {worker.firstName} {worker.lastName}
            </p>
            <p className="text-xs text-slate-400">
              {worker.role.replace(/_/g, ' ')} · Turno {worker.shift} · Casco {helmet.model} · {helmet.serialNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-slate-400">
            <p>Batería {helmet.lastBatteryPct != null ? `${Math.round(helmet.lastBatteryPct)}%` : '—'}</p>
            <p>{helmet.lastSeenAt ? relativeTime(helmet.lastSeenAt) : 'sin señal'}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Video area */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-1 min-h-0 px-6 pb-4 flex items-center justify-center"
      >
        <div className="relative w-full max-w-[1400px] aspect-video rounded-xl overflow-hidden bg-black ring-1 ring-white/10">
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
                <Video size={64} className="text-slate-700" />
              </div>
            )
          ) : (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-500">
              <VideoOff size={48} />
              <p className="text-sm">Sin señal</p>
            </div>
          )}

          {online && (
            <span className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded bg-black/60 backdrop-blur text-xs font-semibold text-severity-critical uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-severity-critical animate-pulse" />
              En vivo
            </span>
          )}
        </div>
      </div>

      {/* Action bar — placeholders. Funcionales cuando llegue el hardware + MediaMTX. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 flex items-center justify-center gap-3 pb-6"
      >
        <ActionButton icon={Mic} label="Hablar (PTT)" />
        <ActionButton icon={Volume2} label="Escuchar" />
        <ActionButton icon={Camera} label="Capturar foto" />
        <ActionButton icon={MessageCircle} label="Enviar mensaje" />
      </div>
    </div>
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
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-slate-200 transition"
      title={label}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}
