import type {
  Alert,
  AlertStatus,
  ExposureRecord,
  Geofence,
  Helmet,
  Id,
  Photo,
  TelemetrySample,
  Worker,
  WorkerDailyStats,
} from '@hela/contracts';
import type { Subscribable } from './subscription.js';

/**
 * Filtros usados en varias queries. Se componen, no son exclusivos.
 * Cualquier backend debe respetarlos — si no soporta alguno, documenta
 * la limitación y aproxima (ej. filtrar en memoria).
 */
export interface SiteScopedQuery {
  siteId: Id;
  limit?: number;
}

export interface TimeRangeQuery {
  from: string; // ISO-8601
  to: string;
}

// --- Workers -----------------------------------------------------------------

export interface WorkerRepository {
  get(id: Id): Promise<Worker | null>;
  listBySite(query: SiteScopedQuery): Promise<Worker[]>;
  upsert(worker: Worker): Promise<void>;
  setAssignedHelmet(workerId: Id, helmetId: Id | null): Promise<void>;
  /** Stream de todos los trabajadores activos de un site (para el mapa). */
  watchActiveBySite(siteId: Id): Subscribable<Worker[]>;
}

// --- Helmets -----------------------------------------------------------------

export interface HelmetRepository {
  get(id: Id): Promise<Helmet | null>;
  listBySite(query: SiteScopedQuery): Promise<Helmet[]>;
  upsert(helmet: Helmet): Promise<void>;
  /** Actualiza los campos desnormalizados de última lectura. */
  updateLastSeen(
    id: Id,
    update: Pick<Helmet, 'lastBatteryPct' | 'lastSignalDbm' | 'lastSeenAt' | 'connectivity'>,
  ): Promise<void>;
  watchBySite(siteId: Id): Subscribable<Helmet[]>;
}

// --- Telemetry (append-only) -------------------------------------------------

export interface TelemetryRepository {
  append(sample: TelemetrySample): Promise<void>;
  listByHelmet(
    helmetId: Id,
    range: TimeRangeQuery & { limit?: number },
  ): Promise<TelemetrySample[]>;
  /** Último sample conocido de un casco. */
  getLatest(helmetId: Id): Promise<TelemetrySample | null>;
  /**
   * Stream de posiciones en vivo de toda la flota de un site. El stream
   * puede coalescer múltiples muestras por casco — el consumidor solo
   * necesita "dónde está cada uno ahora".
   */
  watchLivePositions(siteId: Id): Subscribable<LivePosition[]>;
}

export interface LivePosition {
  helmetId: Id;
  workerId: Id | null;
  timestamp: string;
  lat: number;
  lng: number;
  batteryPct: number;
  connectivity: 'online' | 'degraded' | 'offline';
  accuracyM: number | null;
  headingDeg: number | null;
  speedMps: number | null;
}

// --- Alerts ------------------------------------------------------------------

export interface AlertRepository {
  create(alert: Alert): Promise<void>;
  get(id: Id): Promise<Alert | null>;
  listOpenBySite(siteId: Id, limit?: number): Promise<Alert[]>;
  updateStatus(
    id: Id,
    patch: {
      status: AlertStatus;
      actorUserId: Id;
      notes?: string;
    },
  ): Promise<void>;
  watchOpenBySite(siteId: Id): Subscribable<Alert[]>;
  watchRecentBySite(siteId: Id, limit?: number): Subscribable<Alert[]>;
}

// --- Photos ------------------------------------------------------------------

export interface PhotoRepository {
  create(photo: Photo): Promise<void>;
  listByWorker(workerId: Id, limit?: number): Promise<Photo[]>;
  listBySite(siteId: Id, limit?: number): Promise<Photo[]>;
  /** Devuelve una URL de descarga firmada con TTL corto. */
  getDownloadUrl(storagePath: string): Promise<string>;
  watchByWorker(workerId: Id, limit?: number): Subscribable<Photo[]>;
}

// --- Geofences ---------------------------------------------------------------

export interface GeofenceRepository {
  get(id: Id): Promise<Geofence | null>;
  listBySite(siteId: Id): Promise<Geofence[]>;
  upsert(geofence: Geofence): Promise<void>;
  watchBySite(siteId: Id): Subscribable<Geofence[]>;
}

// --- Exposure / Stats --------------------------------------------------------

export interface ExposureRepository {
  listByWorker(workerId: Id, range: TimeRangeQuery): Promise<ExposureRecord[]>;
  listBySite(siteId: Id, range: TimeRangeQuery): Promise<ExposureRecord[]>;
  upsert(record: ExposureRecord): Promise<void>;
}

export interface WorkerDailyStatsRepository {
  getForDate(workerId: Id, dateYmd: string): Promise<WorkerDailyStats | null>;
  listByWorker(
    workerId: Id,
    range: { fromYmd: string; toYmd: string },
  ): Promise<WorkerDailyStats[]>;
  listBySite(siteId: Id, dateYmd: string): Promise<WorkerDailyStats[]>;
  upsert(stats: WorkerDailyStats): Promise<void>;
}

// --- Fachada -----------------------------------------------------------------

/**
 * Punto único de entrada. El dashboard, el emulador y las Cloud Functions
 * consumen un `DataAccess` — nadie toca Firestore/Postgres directamente.
 */
export interface DataAccess {
  workers: WorkerRepository;
  helmets: HelmetRepository;
  telemetry: TelemetryRepository;
  alerts: AlertRepository;
  photos: PhotoRepository;
  geofences: GeofenceRepository;
  exposure: ExposureRepository;
  workerStats: WorkerDailyStatsRepository;
}
