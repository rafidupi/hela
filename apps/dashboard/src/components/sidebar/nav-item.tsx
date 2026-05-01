'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type { NavItemDef } from './nav-config';

interface Props {
  item: NavItemDef;
  active: boolean;
  collapsed: boolean;
  onAction?: (action: NonNullable<NavItemDef['action']>) => void;
}

export function NavItem({ item, active, collapsed, onAction }: Props) {
  const Icon = item.icon;
  const danger = item.tone === 'danger';

  const baseClasses = clsx(
    'group flex items-center gap-3 rounded-lg transition-colors w-full',
    'px-3 py-2 text-sm',
    collapsed && 'justify-center',
    active
      ? 'bg-brand-500/20 text-neutral-900'
      : danger
        ? 'text-severity-critical hover:bg-severity-critical/10'
        : 'text-neutral-700 hover:bg-black/5 hover:text-neutral-900',
  );

  const iconNode = (
    <Icon
      size={18}
      className={clsx(
        'shrink-0',
        active
          ? 'text-neutral-900'
          : danger
            ? 'text-severity-critical'
            : 'text-neutral-600 group-hover:text-neutral-900',
      )}
    />
  );

  const labelAndBadges = !collapsed && (
    <>
      <span className="flex-1 truncate text-left">{item.label}</span>
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
  );

  // Action items render as buttons (e.g. "Cerrar sesión").
  if (item.action) {
    return (
      <button
        type="button"
        onClick={() => onAction?.(item.action!)}
        className={baseClasses}
        title={collapsed ? item.label : undefined}
      >
        {iconNode}
        {labelAndBadges}
      </button>
    );
  }

  // Regular nav items render as Links.
  return (
    <Link
      href={item.href ?? '#'}
      className={baseClasses}
      title={collapsed ? item.label : undefined}
    >
      {iconNode}
      {labelAndBadges}
    </Link>
  );
}
