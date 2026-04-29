import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon = Construction }: Props) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="h-14 shrink-0 border-b border-white/5 flex items-center px-5">
        <h1 className="text-base font-semibold">{title}</h1>
      </header>
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="max-w-md text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-full bg-brand-600/15 items-center justify-center">
            <Icon size={28} className="text-brand-500" />
          </div>
          <h2 className="text-lg font-medium text-slate-200">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
          <p className="text-xs text-slate-500">
            Esta vista se conecta a los mismos datos del Panel General. Está planificada para la iteración
            posterior al viernes.
          </p>
        </div>
      </div>
    </div>
  );
}
