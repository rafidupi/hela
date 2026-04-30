/**
 * Nombres canónicos de colecciones Firestore. Centralizados para evitar typos
 * y para poder renombrar en un solo lugar si cambia el esquema.
 *
 * La jerarquía es plana en el primer nivel (fácil de consultar con reglas
 * simples) salvo telemetría, que va en subcolección por casco para evitar
 * colecciones monstruosas.
 */
export const COLLECTIONS = {
  sites: 'sites',
  users: 'users',
  workers: 'workers',
  crews: 'crews',
  helmets: 'helmets',
  alerts: 'alerts',
  photos: 'photos',
  geofences: 'geofences',
  exposureRecords: 'exposure_records',
  workerDailyStats: 'worker_daily_stats',
  /** Subcolección: `helmets/{helmetId}/telemetry/{timestamp}` */
  telemetry: 'telemetry',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
