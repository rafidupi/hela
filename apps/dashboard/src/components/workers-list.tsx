'use client';

import type { Helmet, Worker } from '@hela/contracts';
import { relativeTime } from '@/lib/format';

interface Props {
  workers: Worker[];
  helmetsById: Map<string, Helmet>;
  selectedHelmetId: string | null;
  onSelect?: (helmetId: string) => void;
}

export function WorkersList({ workers, helmetsById, selectedHelmetId, onSelect }: Props) {
  return (
    <ul className="divide-y divide-white/5">
      {workers.map((w) => {
        const h = w.assignedHelmetId ? helmetsById.get(w.assignedHelmetId) : undefined;
        const battery = h?.lastBatteryPct;
        const status = h?.connectivity ?? 'offline';
        const selected = h?.id === selectedHelmetId;

        return (
          <li
            key={w.id}
            onClick={() => h && onSelect?.(h.id)}
            className={`p-3 cursor-pointer transition ${selected ? 'bg-brand-600/15' : 'hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  status === 'online' ? 'bg-emerald-400' : status === 'degraded' ? 'bg-amber-400' : 'bg-slate-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {w.firstName} {w.lastName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {w.role.replace(/_/g, ' ')} · Turno {w.shift} · {h?.model ?? '—'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-300">{battery != null ? `${Math.round(battery)}%` : '—'}</p>
                <p className="text-[10px] text-slate-500">
                  {h?.lastSeenAt ? relativeTime(h.lastSeenAt) : 'sin señal'}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
