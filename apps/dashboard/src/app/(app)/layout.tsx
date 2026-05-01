'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Alert, Geofence, Helmet, Worker } from '@hela/contracts';
import type { LivePosition } from '@hela/data-access';
import { Sidebar } from '@/components/sidebar';
import { MapView } from '@/components/map-view';
import { WorkerDrawer } from '@/components/worker-drawer';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentSiteId } from '@/hooks/use-site';
import { useSubscribable } from '@/hooks/use-subscribable';
import { getDataAccess } from '@/lib/data-access';
import type { ExposureBarDatum } from '@/components/charts/exposure-bar';
import { CHUQUI_CENTER } from './dashboard/_site-defaults';

/**
 * Contexto compartido por todas las páginas de la app: el mapa vive en el
 * layout (siempre visible de fondo), y cada página consume datos + estado
 * desde acá. Una sola subscripción a Firestore por sesión.
 */
interface AppContextValue {
  siteId: string;
  positions: LivePosition[];
  workers: Worker[];
  helmets: Helmet[];
  helmetsById: Map<string, Helmet>;
  geofences: Geofence[];
  openAlerts: Alert[];
  recentAlerts: Alert[];
  selectedHelmetId: string | null;
  setSelectedHelmetId: (id: string | null) => void;
  selectedWorker: Worker | null;
  selectedHelmet: Helmet | null;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** px offset from the left viewport edge where floating panels should start. */
  contentLeftOffset: number;
}

/**
 * Pixel math for floating panels next to the sidebar:
 * 16px (sidebar's left-4 gap) + sidebar width + 16px (gap to panel) = offset.
 */
const SIDEBAR_GAP = 16;
const SIDEBAR_EXPANDED = 256; // w-64
const SIDEBAR_COLLAPSED = 72;
export const CONTENT_LEFT_EXPANDED = SIDEBAR_GAP * 2 + SIDEBAR_EXPANDED; // 288
export const CONTENT_LEFT_COLLAPSED = SIDEBAR_GAP * 2 + SIDEBAR_COLLAPSED; // 104

const AppContext = createContext<AppContextValue | null>(null);

export function useAppData(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within (app)/layout');
  return ctx;
}

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

  return <AppShell userKey={user.uid}>{children}</AppShell>;
}

function AppShell({ userKey, children }: { userKey: string; children: React.ReactNode }) {
  const da = getDataAccess();
  const siteId = useCurrentSiteId();
  const [selectedHelmetId, setSelectedHelmetId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const contentLeftOffset = sidebarCollapsed ? CONTENT_LEFT_COLLAPSED : CONTENT_LEFT_EXPANDED;

  const { value: positions } = useSubscribable<LivePosition[]>(
    () => da.telemetry.watchLivePositions(siteId),
    [userKey, siteId],
    [],
  );
  const { value: workers } = useSubscribable<Worker[]>(
    () => da.workers.watchActiveBySite(siteId),
    [userKey, siteId],
    [],
  );
  const { value: helmets } = useSubscribable<Helmet[]>(
    () => da.helmets.watchBySite(siteId),
    [userKey, siteId],
    [],
  );
  const { value: geofences } = useSubscribable<Geofence[]>(
    () => da.geofences.watchBySite(siteId),
    [userKey, siteId],
    [],
  );
  const { value: openAlerts } = useSubscribable<Alert[]>(
    () => da.alerts.watchOpenBySite(siteId),
    [userKey, siteId],
    [],
  );
  const { value: recentAlerts } = useSubscribable<Alert[]>(
    () => da.alerts.watchRecentBySite(siteId, 200),
    [userKey, siteId],
    [],
  );

  const helmetsById = useMemo(() => new Map(helmets.map((h) => [h.id, h])), [helmets]);
  const workerByHelmetId = useMemo(
    () =>
      new Map(
        workers
          .filter((w): w is Worker & { assignedHelmetId: string } => !!w.assignedHelmetId)
          .map((w) => [w.assignedHelmetId, w]),
      ),
    [workers],
  );

  const selectedHelmet = selectedHelmetId ? helmetsById.get(selectedHelmetId) ?? null : null;
  const selectedWorker = selectedHelmetId ? workerByHelmetId.get(selectedHelmetId) ?? null : null;

  const exposureDemo: ExposureBarDatum[] = useMemo(() => {
    if (!selectedWorker) return [];
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const seed = selectedWorker.id.length;
    return days.map((label, i) => ({
      label,
      polvo: (seed * 17 + i * 23) % 120,
      ruido: (seed * 7 + i * 11) % 90,
      altura: (seed * 3 + i * 5) % 40,
      alta_tension: (seed + i) % 20,
    }));
  }, [selectedWorker]);

  const ctxValue: AppContextValue = {
    siteId,
    positions,
    workers,
    helmets,
    helmetsById,
    geofences,
    openAlerts,
    recentAlerts,
    selectedHelmetId,
    setSelectedHelmetId,
    selectedWorker,
    selectedHelmet,
    sidebarCollapsed,
    setSidebarCollapsed,
    contentLeftOffset,
  };

  return (
    <AppContext.Provider value={ctxValue}>
      <div className="relative h-screen w-screen overflow-hidden bg-surface">
        {/* Map is the universal background. Always visible behind every page. */}
        <div className="absolute inset-0">
          <MapView
            center={CHUQUI_CENTER}
            zoom={13}
            positions={positions}
            geofences={geofences}
            selectedHelmetId={selectedHelmetId}
            onSelectHelmet={setSelectedHelmetId}
            watermarkLeftOffset={contentLeftOffset}
            // Worker drawer is 380px wide + 16px gap from the right edge,
            // plus a small 16px breathing gap before the attribution button.
            attributionRightOffset={selectedWorker ? 380 + 16 + 16 : 0}
          />
        </div>

        {/* Page content floats over the map. `pointer-events-none` lets clicks
            fall through to the map by default; each floating panel re-enables
            them with `pointer-events-auto`. */}
        <main className="absolute inset-0 flex flex-col pointer-events-none">{children}</main>

        {/* Worker drawer is global — pops up on any page when a helmet is selected. */}
        <WorkerDrawer
          worker={selectedWorker}
          helmet={selectedHelmet}
          exposure={exposureDemo}
          onClose={() => setSelectedHelmetId(null)}
        />

        <Sidebar />
      </div>
    </AppContext.Provider>
  );
}
