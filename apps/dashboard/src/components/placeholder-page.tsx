import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon = Construction }: Props) {
  return (
    <div className="relative flex-1 flex items-center justify-center p-10">
      <div className="max-w-md text-center space-y-4 px-8 py-10 rounded-2xl border border-white/40 bg-white/20 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,0,0,0.18)] pointer-events-auto">
        <div className="inline-flex w-14 h-14 rounded-full bg-brand-500/30 items-center justify-center">
          <Icon size={28} className="text-neutral-900" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <p className="text-sm text-neutral-700">{description}</p>
        <p className="text-xs text-neutral-700">
          Esta vista se conecta a los mismos datos del Panel General. Está planificada para la iteración
          posterior al viernes.
        </p>
      </div>
    </div>
  );
}
