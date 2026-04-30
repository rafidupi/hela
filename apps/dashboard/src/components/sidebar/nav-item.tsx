'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type { NavItemDef } from './nav-config';

interface Props {
  item: NavItemDef;
  active: boolean;
  collapsed: boolean;
}

export function NavItem({ item, active, collapsed }: Props) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={clsx(
        'group flex items-center gap-3 rounded-lg transition-colors',
        'px-3 py-2 text-sm',
        collapsed && 'justify-center',
        active
          ? 'bg-brand-600/15 text-brand-500'
          : 'text-slate-300 hover:bg-white/5 hover:text-white',
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon
        size={18}
        className={clsx('shrink-0', active ? 'text-brand-500' : 'text-slate-400 group-hover:text-white')}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge === 'live' && (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              Live
            </span>
          )}
          {typeof item.badge === 'number' && item.badge > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-severity-critical text-white">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
