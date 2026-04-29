'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { FOOTER_ITEMS, NAV_GROUPS } from './nav-config';
import { NavItem } from './nav-item';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  };

  async function handleAction(action: 'home' | 'logout') {
    if (action === 'home') router.push('/dashboard');
    if (action === 'logout') {
      await logout();
      router.replace('/login');
    }
  }

  return (
    <aside
      className={clsx(
        'shrink-0 h-full flex flex-col border-r border-white/5 bg-surface-elevated',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Header: brand mark + collapse toggle */}
      <div className={clsx('flex items-center px-4 py-5 border-b border-white/5', collapsed ? 'justify-center px-2' : 'justify-between')}>
        {collapsed ? (
          <span className="text-lg font-bold tracking-[0.08em]">
            h<span className="text-brand-500">.</span>
          </span>
        ) : (
          <>
            <span className="text-lg font-bold tracking-[0.08em]">
              hela<span className="text-brand-500">.</span>
            </span>
            <button
              onClick={() => setCollapsed(true)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Colapsar menú"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        )}
      </div>

      {/* Expand toggle when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto my-2 text-slate-400 hover:text-white"
          aria-label="Expandir menú"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* User card */}
      {user && (
        <div className={clsx('px-3 pt-3', collapsed && 'px-2')}>
          <div
            className={clsx(
              'panel-muted flex items-center gap-3',
              collapsed ? 'justify-center p-2' : 'p-3',
            )}
          >
            <div className="w-8 h-8 rounded-full bg-white/10 ring-1 ring-white/15 flex items-center justify-center shrink-0 text-sm font-semibold text-white">
              {(user.displayName ?? user.email ?? '?').slice(0, 1).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.displayName ?? user.email}</p>
                <p className="text-[11px] text-slate-400 truncate">Prevencionista</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.id} className="panel-muted p-1">
            {!collapsed && group.title && (
              <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                {group.title}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-3 pt-2 border-t border-white/5 space-y-0.5">
        {FOOTER_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.action}
              onClick={() => handleAction(item.action)}
              className={clsx(
                'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                collapsed && 'justify-center',
                item.tone === 'danger'
                  ? 'text-severity-critical hover:bg-severity-critical/10'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white',
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
