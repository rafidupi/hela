'use client';

import { useMemo, useState } from 'react';
import type { Geofence, Helmet, Worker } from '@hela/contracts';
import type { LivePosition } from '@hela/data-access';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentSiteId } from '@/hooks/use-site';
import { useSubscribable } from '@/hooks/use-subscribable';
import { getDataAccess } from '@/lib/data-access';
import { MapView } from '@/components/map-view';
import { WorkerDrawer } from '@/components/worker-drawer';
import { CHUQUI_CENTER } from '../dashboard/_site-defaults';
import type { ExposureBarDatum } from '@/components/charts/exposure-bar';

export default function MapPage() {
  const { user } = useAuth();
  const siteId = useCurrentSiteId();
  const da = getDataAccess();
  const [selectedHelmetId, setSelectedHelmetId] = useState<string | null>(null);

  const userKey = user?.uid ?? '';

  const { value: positions } = useSubscribable<LivePosition[]>(
    () => (user ? da.telemetry.watchLivePositions(siteId) : null),
    [userKey, siteId],
    [],
  );
  const { value: workers } = useSubscribable<Worker[]>(
    () => (user ? da.workers.watchActiveBySite(siteId) : null),
    [userKey, siteId],
    [],
  );
  const { value: helmets } = useSubscribable<Helmet[]>(
    () => (user ? da.helmets.watchBySite(siteId) : null),
    [userKey, siteId],
    [],
  );
  const { value: geofences } = useSubscribable<Geofence[]>(
    () => (user ? da.geofences.watchBySite(siteId) : null),
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

  return (
    <div className="flex-1 relative">
      <MapView
        center={CHUQUI_CENTER}
        zoom={13}
        positions={positions}
        geofences={geofences}
        selectedHelmetId={selectedHelmetId}
        onSelectHelmet={setSelectedHelmetId}
      />
      <WorkerDrawer
        worker={selectedWorker}
        helmet={selectedHelmet}
        exposure={exposureDemo}
        onClose={() => setSelectedHelmetId(null)}
      />
    </div>
  );
}
