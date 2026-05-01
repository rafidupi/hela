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
      <div className="p-6 text-sm text-neutral-700 text-center">
        Sin alertas abiertas. Todo bajo control.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-black/10">
      {alerts.map((a) => (
        <li
          key={a.id}
          className="p-3 hover:bg-black/5 cursor-pointer transition"
          onClick={() => onSelect?.(a)}
        >
          <div className="flex items-start gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${severityColor(a.severity)}`}>
              {severityLabel(a.severity)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{alertLabel(a.type)}</p>
              <p className="text-xs text-neutral-700 truncate">{a.message}</p>
              <p className="text-[11px] text-neutral-700 mt-1">{relativeTime(a.occurredAt)}</p>
            </div>
            {onAcknowledge && (
              <button
                className="text-xs text-neutral-900 font-medium hover:underline"
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
