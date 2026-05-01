import { z } from 'zod';
import { AuditFields, Id, Iso8601 } from './common.js';
import { GeofenceCategory } from './geofence.js';

/**
 * Registro agregado de exposición de un trabajador a una geocerca de riesgo
 * durante un día. Generado por Cloud Function al evaluar telemetría.
 * Granularidad diaria; si se necesita por turno, se particiona por `shiftKey`.
 *
 * Clave natural: `${workerId}_${dateYmd}_${geofenceId}`.
 */
export const ExposureRecord = z
  .object({
    id: Id,
    workerId: Id,
    siteId: Id,
    geofenceId: Id,
    category: GeofenceCategory,
    /** Fecha local (America/Santiago) en formato YYYY-MM-DD. */
    dateYmd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    shiftKey: z.string().nullable(),
    /** Minutos acumulados dentro de la geocerca ese día. */
    minutesInside: z.number().min(0),
    firstEntryAt: Iso8601,
    lastExitAt: Iso8601.nullable(),
    /** Número de entradas (útil como proxy de comportamiento). */
    entryCount: z.number().int().min(0),
    /** Si se excedió `Geofence.maxExposureMinutesPerShift`. */
    overExposed: z.boolean(),
  })
  .merge(AuditFields);
export type ExposureRecord = z.infer<typeof ExposureRecord>;

/**
 * Agregado por trabajador y día sobre *todas* las zonas. Facilita la vista
 * "cuánto estuvo expuesto Juan esta semana" sin hacer N queries.
 */
export const WorkerDailyStats = z
  .object({
    id: Id, // `${workerId}_${dateYmd}`
    workerId: Id,
    siteId: Id,
    dateYmd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    minutesActive: z.number().min(0),
    minutesByCategory: z.record(GeofenceCategory, z.number().min(0)),
    distanceKm: z.number().min(0),
    alertCounts: z.record(z.string(), z.number().int().min(0)),
    geofenceBreaches: z.number().int().min(0),
    /**
     * Score simple 0–100. Lo calcula Cloud Functions como combinación lineal
     * de exposición, alertas y breaches. Configurable por site.
     */
    riskScore: z.number().min(0).max(100),
  })
  .merge(AuditFields);
export type WorkerDailyStats = z.infer<typeof WorkerDailyStats>;
