'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { useAuth } from '@/hooks/use-auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-400">Cargando…</main>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-surface">
      <Sidebar />
      <main className="relative flex-1 min-w-0 min-h-0 flex flex-col">{children}</main>
    </div>
  );
}
