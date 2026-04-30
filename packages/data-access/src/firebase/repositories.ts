import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as qLimit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { getDownloadURL, ref, type FirebaseStorage } from 'firebase/storage';
import {
  COLLECTIONS,
  type Alert,
  type AlertStatus,
  type ExposureRecord,
  type Geofence,
  type Helmet,
  type Id,
  type Photo,
  type TelemetrySample,
  type Worker,
  type WorkerDailyStats,
} from '@hela/contracts';
import type {
  AlertRepository,
  DataAccess,
  ExposureRepository,
  GeofenceRepository,
  HelmetRepository,
  LivePosition,
  PhotoRepository,
  Subscribable,
  TelemetryRepository,
  Unsubscribe,
  WorkerDailyStatsRepository,
  WorkerRepository,
} from '../interfaces/index.js';

/**
 * Helper: convierte un `onSnapshot` en una implementación de `Subscribable<T>`.
 * El mapeador recibe el snapshot y retorna el valor tipado.
 */
function toSubscribable<T>(
  factory: (onNext: (v: T) => void, onErr: (e: Error) => void) => Unsubscribe,
): Subscribable<T> {
  return {
    subscribe(onChange, onError) {
      return factory(onChange, (e) => onError?.(e));
    },
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

// --- Workers -----------------------------------------------------------------

export class FirestoreWorkerRepository implements WorkerRepository {
  constructor(private readonly db: Firestore) {}

  async get(id: Id) {
    const s = await getDoc(doc(this.db, COLLECTIONS.workers, id));
    return s.exists() ? (s.data() as Worker) : null;
  }

  async listBySite({ siteId, limit }: { siteId: Id; limit?: number }) {
    const q = query(
      collection(this.db, COLLECTIONS.workers),
      where('siteId', '==', siteId),
      where('active', '==', true),
      qLimit(limit ?? 500),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Worker);
  }

  async upsert(worker: Worker) {
    await setDoc(doc(this.db, COLLECTIONS.workers, worker.id), worker, { merge: true });
  }

  async setAssignedHelmet(workerId: Id, helmetId: Id | null) {
    await updateDoc(doc(this.db, COLLECTIONS.workers, workerId), {
      assignedHelmetId: helmetId,
      updatedAt: nowIso(),
    });
  }

  watchActiveBySite(siteId: Id) {
    return toSubscribable<Worker[]>((onNext, onErr) => {
      const q = query(
        collection(this.db, COLLECTIONS.workers),
        where('siteId', '==', siteId),
        where('active', '==', true),
      );
      return onSnapshot(
        q,
        (snap) => onNext(snap.docs.map((d) => d.data() as Worker)),
        (err) => onErr(err as Error),
      );
    });
  }
}

// --- Helmets -----------------------------------------------------------------

export class FirestoreHelmetRepository implements HelmetRepository {
  constructor(private readonly db: Firestore) {}

  async get(id: Id) {
    const s = await getDoc(doc(this.db, COLLECTIONS.helmets, id));
    return s.exists() ? (s.data() as Helmet) : null;
  }

  async listBySite({ siteId, limit }: { siteId: Id; limit?: number }) {
    const q = query(
      collection(this.db, COLLECTIONS.helmets),
      where('siteId', '==', siteId),
      qLimit(limit ?? 500),
    );
    return (await getDocs(q)).docs.map((d) => d.data() as Helmet);
  }

  async upsert(helmet: Helmet) {
    await setDoc(doc(this.db, COLLECTIONS.helmets, helmet.id), helmet, { merge: true });
  }

  async updateLastSeen(
    id: Id,
    update: Pick<Helmet, 'lastBatteryPct' | 'lastSignalDbm' | 'lastSeenAt' | 'connectivity'>,
  ) {
    await updateDoc(doc(this.db, COLLECTIONS.helmets, id), { ...update, updatedAt: nowIso() });
  }

  watchBySite(siteId: Id) {
    return toSubscribable<Helmet[]>((onNext, onErr) => {
      const q = query(collection(this.db, COLLECTIONS.helmets), where('siteId', '==', siteId));
      return onSnapshot(
        q,
        (snap) => onNext(snap.docs.map((d) => d.data() as Helmet)),
        (err) => onErr(err as Error),
      );
    });
  }
}

// --- Telemetry ---------------------------------------------------------------

export class FirestoreTelemetryRepository implements TelemetryRepository {
  constructor(private readonly db: Firestore) {}

  private telCol(helmetId: Id) {
    return collection(this.db, COLLECTIONS.helmets, helmetId, COLLECTIONS.telemetry);
  }

  async append(sample: TelemetrySample) {
    // Id determinístico por timestamp evita duplicados por reintento.
    const id = sample.timestamp.replace(/[^0-9]/g, '').slice(0, 17);
    await setDoc(doc(this.telCol(sample.helmetId), id), sample);
  }

  async listByHelmet(helmetId: Id, range: { from: string; to: string; limit?: number }) {
    const q = query(
      this.telCol(helmetId),
      where('timestamp', '>=', range.from),
      where('timestamp', '<=', range.to),
      orderBy('timestamp', 'desc'),
      qLimit(range.limit ?? 1000),
    );
    return (await getDocs(q)).docs.map((d) => d.data() as TelemetrySample);
  }

  async getLatest(helmetId: Id) {
    const q = query(this.telCol(helmetId), orderBy('timestamp', 'desc'), qLimit(1));
    const snap = await getDocs(q);
    const first = snap.docs[0];
    return first ? (first.data() as TelemetrySample) : null;
  }

  /**
   * Implementación MVP: subscribe al doc de cada casco y deriva posición
   * desde los campos desnormalizados. Esto escala bien hasta ~500 cascos;
   * más allá se agrega una colección `live_positions` escrita por Cloud
   * Function y se suscribe a eso en su lugar.
   */
  watchLivePositions(siteId: Id): Subscribable<LivePosition[]> {
    return toSubscribable<LivePosition[]>((onNext, onErr) => {
      const helmetsQ = query(
        collection(this.db, COLLECTIONS.helmets),
        where('siteId', '==', siteId),
      );
      // Estado compartido entre las subscripciones hijas.
      const positionByHelmet = new Map<string, LivePosition>();
      const telUnsubs = new Map<string, Unsubscribe>();

      const emit = () => onNext(Array.from(positionByHelmet.values()));

      const helmetsUnsub = onSnapshot(
        helmetsQ,
        (snap) => {
          const seen = new Set<string>();
          snap.docs.forEach((d) => {
            const h = d.data() as Helmet;
            seen.add(h.id);
            if (telUnsubs.has(h.id)) return;

            // Escuchar la última muestra de telemetría de este casco.
            const latestQ = query(
              this.telCol(h.id),
              orderBy('timestamp', 'desc'),
              qLimit(1),
            );
            const unsub = onSnapshot(
              latestQ,
              (s) => {
                const t = s.docs[0]?.data() as TelemetrySample | undefined;
                if (!t || !t.position) return;
                positionByHelmet.set(h.id, {
                  helmetId: h.id,
                  workerId: t.workerId,
                  timestamp: t.timestamp,
                  lat: t.position.lat,
                  lng: t.position.lng,
                  batteryPct: t.batteryPct,
                  connectivity: h.connectivity,
                  accuracyM: t.accuracyM,
                  headingDeg: t.headingDeg,
                  speedMps: t.speedMps,
                });
                emit();
              },
              (err) => onErr(err as Error),
            );
            telUnsubs.set(h.id, unsub);
          });

          // Limpiar cascos removidos del site.
          for (const id of Array.from(telUnsubs.keys())) {
            if (!seen.has(id)) {
              telUnsubs.get(id)?.();
              telUnsubs.delete(id);
              positionByHelmet.delete(id);
            }
          }
          emit();
        },
        (err) => onErr(err as Error),
      );

      return () => {
        helmetsUnsub();
        telUnsubs.forEach((u) => u());
        telUnsubs.clear();
      };
    });
  }
}

// --- Alerts ------------------------------------------------------------------

export class FirestoreAlertRepository implements AlertRepository {
  constructor(private readonly db: Firestore) {}

  async create(alert: Alert) {
    await setDoc(doc(this.db, COLLECTIONS.alerts, alert.id), alert);
  }

  async get(id: Id) {
    const s = await getDoc(doc(this.db, COLLECTIONS.alerts, id));
    return s.exists() ? (s.data() as Alert) : null;
  }

  async listOpenBySite(siteId: Id, limit = 100) {
    const q = query(
      collection(this.db, COLLECTIONS.alerts),
      where('siteId', '==', siteId),
      where('status', '==', 'open'),
      orderBy('occurredAt', 'desc'),
      qLimit(limit),
    );
    return (await getDocs(q)).docs.map((d) => d.data() as Alert);
  }

  async updateStatus(
    id: Id,
    patch: { status: AlertStatus; actorUserId: Id; notes?: string },
  ) {
    const now = nowIso();
    const updates: Record<string, unknown> = { status: patch.status, updatedAt: now };
    if (patch.status === 'acknowledged') {
      updates.acknowledgedByUserId = patch.actorUserId;
      updates.acknowledgedAt = now;
    }
    if (patch.status === 'resolved') {
      updates.resolvedByUserId = patch.actorUserId;
      updates.resolvedAt = now;
      if (patch.notes) updates.resolutionNotes = patch.notes;
    }
    await updateDoc(doc(this.db, COLLECTIONS.alerts, id), updates);
  }

  watchOpenBySite(siteId: Id) {
    return toSubscribable<Alert[]>((onNext, onErr) => {
      const q = query(
        collection(this.db, COLLECTIONS.alerts),
        where('siteId', '==', siteId),
        where('status', '==', 'open'),
        orderBy('occurredAt', 'desc'),
        qLimit(100),
      );
      return onSnapshot(
        q,
        (snap) => onNext(snap.docs.map((d) => d.data() as Alert)),
        (err) => onErr(err as Error),
      );
    });
  }

  watchRecentBySite(siteId: Id, limit = 50) {
    return toSubscribable<Alert[]>((onNext, onErr) => {
      const q = query(
        collection(this.db, COLLECTIONS.alerts),
        where('siteId', '==', siteId),
        orderBy('occurredAt', 'desc'),
        qLimit(limit),
      );
      return onSnapshot(
        q,
        (snap) => onNext(snap.docs.map((d) => d.data() as Alert)),
        (err) => onErr(err as Error),
      );
    });
  }
}

// --- Photos ------------------------------------------------------------------

export class FirestorePhotoRepository implements PhotoRepository {
  constructor(
    private readonly db: Firestore,
    private readonly storage: FirebaseStorage,
  ) {}

  async create(photo: Photo) {
    await setDoc(doc(this.db, COLLECTIONS.photos, photo.id), photo);
  }

  async listByWorker(workerId: Id, limit = 50) {
    const q = query(
      collection(this.db, COLLECTIONS.photos),
      where('workerId', '==', workerId),
      orderBy('takenAt', 'desc'),
      qLimit(limit),
    );
    return (await getDocs(q)).docs.map((d) => d.data() as Photo);
  }

  async listBySite(siteId: Id, limit = 50) {
    const q = query(
      collection(this.db, COLLECTIONS.photos),
      where('siteId', '==', siteId),
      orderBy('takenAt', 'desc'),
      qLimit(limit),
    );
    return (await getDocs(q)).docs.map((d) => d.data() as Photo);
  }

  getDownloadUrl(storagePath: string) {
    return getDownloadURL(ref(this.storage, storagePath));
  }

  watchByWorker(workerId: Id, limit = 50) {
    return toSubscribable<Photo[]>((onNext, onErr) => {
      const q = query(
        collection(this.db, COLLECTIONS.photos),
        where('workerId', '==', workerId),
        orderBy('takenAt', 'desc'),
        qLimit(limit),
      );
      return onSnapshot(
        q,
        (snap) => onNext(snap.docs.map((d) => d.data() as Photo)),
        (err) => onErr(err as Error),
      );
    });
  }
}

// --- Geofences ---------------------------------------------------------------

export class FirestoreGeofenceRepository implements GeofenceRepository {
  constructor(private readonly db: Firestore) {}

  async get(id: Id) {
    const s = await getDoc(doc(this.db, COLLECTIONS.geofences, id));
    return s.exists() ? (s.data() as Geofence) : null;
  }

  async listBySite(siteId: Id) {
    const q = query(
      collection(this.db, COLLECTIONS.geofences),
      where('siteId', '==', siteId),
      where('active', '==', true),
    );
    return (await getDocs(q)).docs.map((d) => d.data() as Geofence);
  }

  async upsert(g: Geofence) {
    await setDoc(doc(this.db, COLLECTIONS.geofences, g.id), g, { merge: true });
  }

  watchBySite(siteId: Id) {
    return toSubscribable<Geofence[]>((onNext, onErr) => {
      const q = query(
        collection(this.db, COLLECTIONS.geofences),
        where('siteId', '==', siteId),
        where('active', '==', true),
      );
      return onSnapshot(
        q,
        (snap) => onNext(snap.docs.map((d) => d.data() as Geofence)),
        (err) => onErr(err as Error),
      );
    });
  }
}

// --- Exposure ----------------------------------------------------------------

export class FirestoreExposureRepository implements ExposureRepository {
  constructor(private readonly db: Firestore) {}

  async listByWorker(workerId: Id, range: { from: string; to: string }) {
    const q = query(
      collection(this.db, COLLECTIONS.exposureRecords),
      where('workerId', '==', workerId),
      where('dateYmd', '>=', range.from.slice(0, 10)),
      where('dateYmd', '<=', range.to.slice(0, 10)),
      orderBy('dateYmd', 'desc'),
    );
    return (await getDocs(q)).docs.map((d) => d.data() as ExposureRecord);
  }

  async listBySite(siteId: Id, range: { from: string; to: string }) {
    const q = query(
      collection(this.db, COLLECTIONS.exposureRecords),
      where('siteId', '==', siteId),
      where('dateYmd', '>=', range.from.slice(0, 10)),
      where('dateYmd', '<=', range.to.slice(0, 10)),
    );
    return (await getDocs(q)).docs.map((d) => d.data() as ExposureRecord);
  }

  async upsert(r: ExposureRecord) {
    await setDoc(doc(this.db, COLLECTIONS.exposureRecords, r.id), r, { merge: true });
  }
}

export class FirestoreWorkerDailyStatsRepository implements WorkerDailyStatsRepository {
  constructor(private readonly db: Firestore) {}

  async getForDate(workerId: Id, dateYmd: string) {
    const id = `${workerId}_${dateYmd}`;
    const s = await getDoc(doc(this.db, COLLECTIONS.workerDailyStats, id));
    return s.exists() ? (s.data() as WorkerDailyStats) : null;
  }

  async listByWorker(workerId: Id, range: { fromYmd: string; toYmd: string }) {
    const q = query(
      collection(this.db, COLLECTIONS.workerDailyStats),
      where('workerId', '==', workerId),
      where('dateYmd', '>=', range.fromYmd),
      where('dateYmd', '<=', range.toYmd),
      orderBy('dateYmd', 'desc'),
    );
    return (await getDocs(q)).docs.map((d) => d.data() as WorkerDailyStats);
  }

  async listBySite(siteId: Id, dateYmd: string) {
    const q = query(
      collection(this.db, COLLECTIONS.workerDailyStats),
      where('siteId', '==', siteId),
      where('dateYmd', '==', dateYmd),
    );
    return (await getDocs(q)).docs.map((d) => d.data() as WorkerDailyStats);
  }

  async upsert(stats: WorkerDailyStats) {
    await setDoc(doc(this.db, COLLECTIONS.workerDailyStats, stats.id), stats, { merge: true });
  }
}

// --- Fachada -----------------------------------------------------------------

export function createFirestoreDataAccess(bundle: {
  firestore: Firestore;
  storage: FirebaseStorage;
}): DataAccess {
  const { firestore: db, storage } = bundle;
  return {
    workers: new FirestoreWorkerRepository(db),
    helmets: new FirestoreHelmetRepository(db),
    telemetry: new FirestoreTelemetryRepository(db),
    alerts: new FirestoreAlertRepository(db),
    photos: new FirestorePhotoRepository(db, storage),
    geofences: new FirestoreGeofenceRepository(db),
    exposure: new FirestoreExposureRepository(db),
    workerStats: new FirestoreWorkerDailyStatsRepository(db),
  };
}
