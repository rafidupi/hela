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
    <ul className="divide-y divide-black/10">
      {workers.map((w) => {
        const h = w.assignedHelmetId ? helmetsById.get(w.assignedHelmetId) : undefined;
        const battery = h?.lastBatteryPct;
        const status = h?.connectivity ?? 'offline';
        const selected = h?.id === selectedHelmetId;

        return (
          <li
            key={w.id}
            onClick={() => h && onSelect?.(h.id)}
            className={`p-3 cursor-pointer transition ${selected ? 'bg-brand-500/20' : 'hover:bg-black/5'}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  status === 'online' ? 'bg-emerald-500' : status === 'degraded' ? 'bg-amber-500' : 'bg-neutral-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-neutral-900">
                  {w.firstName} {w.lastName}
                </p>
                <p className="text-[11px] text-neutral-700 truncate">
                  {w.role.replace(/_/g, ' ')} · Turno {w.shift} · {h?.model ?? '—'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-neutral-900">{battery != null ? `${Math.round(battery)}%` : '—'}</p>
                <p className="text-[10px] text-neutral-700">
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
