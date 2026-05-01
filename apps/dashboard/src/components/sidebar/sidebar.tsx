'use client';

import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAppData } from '@/app/(app)/layout';
import { NAV_GROUPS } from './nav-config';
import { NavItem } from './nav-item';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed } = useAppData();

  const isActive = (href: string | undefined) => {
    if (!href) return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  };

  async function handleNavAction(action: 'logout') {
    if (action === 'logout') {
      await logout();
      router.replace('/login');
    }
  }

  return (
    <aside
      className={clsx(
        'absolute left-4 top-4 bottom-4 z-30 flex flex-col rounded-2xl border border-white/40 bg-white/20 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,0,0,0.18)] overflow-hidden',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Header: brand mark + collapse toggle */}
      <div className={clsx('flex items-center px-4 py-3 border-b border-white/40', collapsed ? 'justify-center px-2' : 'justify-between')}>
        {collapsed ? (
          <span className="text-lg font-bold tracking-[0.08em] text-neutral-900">
            h<span className="text-brand-500">.</span>
          </span>
        ) : (
          <>
            <span className="text-lg font-bold tracking-[0.08em] text-neutral-900">
              hela<span className="text-brand-500">.</span>
            </span>
            <button
              onClick={() => setCollapsed(true)}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
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
          className="mx-auto my-2 text-neutral-600 hover:text-neutral-900"
          aria-label="Expandir menú"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Scroll area: user card + nav groups scroll together; header stays fixed. */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {user && (
          <div
            className={clsx(
              'bg-white/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 rounded-xl flex items-center gap-3',
              collapsed ? 'justify-center p-2' : 'p-3',
            )}
          >
            <div className="w-8 h-8 rounded-full bg-neutral-900/10 ring-1 ring-neutral-900/15 flex items-center justify-center shrink-0 text-sm font-semibold text-neutral-900">
              {(user.displayName ?? user.email ?? '?').slice(0, 1).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-neutral-900">{user.displayName ?? user.email}</p>
                <p className="text-[11px] text-neutral-700 truncate">Prevencionista</p>
              </div>
            )}
          </div>
        )}

        <nav className="space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.id} className="bg-white/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 rounded-xl p-1">
              {!collapsed && group.title && (
                <p className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-widest text-neutral-700 font-semibold">
                  {group.title}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.href ?? item.label}
                    item={item}
                    active={isActive(item.href)}
                    collapsed={collapsed}
                    onAction={handleNavAction}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

    </aside>
  );
}
