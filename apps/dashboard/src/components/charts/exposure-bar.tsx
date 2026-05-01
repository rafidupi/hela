'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Datos derivados — el componente es tonto. La agregación se calcula arriba a
 * partir de `ExposureRecord[]` o `WorkerDailyStats[]`.
 */
export interface ExposureBarDatum {
  label: string;
  polvo?: number;
  ruido?: number;
  altura?: number;
  alta_tension?: number;
  calor?: number;
  gases?: number;
}

const CATEGORY_COLORS = {
  polvo: '#eab308',
  ruido: '#8b5cf6',
  altura: '#06b6d4',
  alta_tension: '#f43f5e',
  calor: '#f97316',
  gases: '#22c55e',
} as const;

export function ExposureBar({ data }: { data: ExposureBarDatum[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-slate-500 text-center py-6">Sin exposición registrada.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="#d4d4d4" vertical={false} />
        <XAxis dataKey="label" stroke="#525252" fontSize={11} />
        <YAxis stroke="#525252" fontSize={11} label={{ value: 'min', fill: '#525252', fontSize: 10, angle: -90, position: 'insideLeft' }} />
        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e5e5', color: '#171717' }} />
        {Object.entries(CATEGORY_COLORS).map(([k, color]) => (
          <Bar key={k} dataKey={k} stackId="a" fill={color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
