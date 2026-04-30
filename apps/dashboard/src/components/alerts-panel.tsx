'use client';

import type { Alert } from '@hela/contracts';
import { alertLabel, relativeTime, severityColor, severityLabel } from '@/lib/format';

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge?: (alert: Alert) => void;
  onSelect?: (alert: Alert) => void;
}

export function AlertsPanel({ alerts, onAcknowledge, onSelect }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="p-6 text-sm text-slate-400 text-center">
        Sin alertas abiertas. Todo bajo control.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-white/5">
      {alerts.map((a) => (
        <li
          key={a.id}
          className="p-3 hover:bg-white/5 cursor-pointer transition"
          onClick={() => onSelect?.(a)}
        >
          <div className="flex items-start gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${severityColor(a.severity)}`}>
              {severityLabel(a.severity)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">{alertLabel(a.type)}</p>
              <p className="text-xs text-slate-400 truncate">{a.message}</p>
              <p className="text-[11px] text-slate-500 mt-1">{relativeTime(a.occurredAt)}</p>
            </div>
            {onAcknowledge && (
              <button
                className="text-xs text-brand-500 hover:text-brand-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onAcknowledge(a);
                }}
              >
                Atender
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
