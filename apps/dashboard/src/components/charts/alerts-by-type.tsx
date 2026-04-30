'use client';

import type { Alert } from '@hela/contracts';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { alertLabel } from '@/lib/format';

const COLORS = ['#f43f5e', '#fb923c', '#facc15', '#a3e635', '#38bdf8', '#a78bfa', '#34d399'];

export function AlertsByTypeChart({ alerts }: { alerts: Alert[] }) {
  const byType = new Map<string, number>();
  for (const a of alerts) byType.set(a.type, (byType.get(a.type) ?? 0) + 1);
  const data = Array.from(byType, ([type, count]) => ({ name: alertLabel(type), value: count }));

  if (data.length === 0) {
    return <div className="text-sm text-slate-500 text-center py-6">Sin alertas en el rango.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: '#111a2e', border: '1px solid #1f2937' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
