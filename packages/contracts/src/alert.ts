import { z } from 'zod';
import { AuditFields, GeoPoint, Id, Iso8601 } from './common.js';

/**
 * Tipos de alerta. El origen puede ser:
 * - El casco (SOS, FALL, CAP_OFF, HIGH_VOLTAGE) — detección embarcada.
 * - El backend (GEOFENCE_EXIT, LOW_BATTERY, IMMOBILITY, LOST_SIGNAL, FATIGUE) —
 *   Cloud Functions evaluando telemetría.
 */
export const AlertType = z.enum([
  'SOS',
  'FALL',
  'CAP_OFF',
  'HIGH_VOLTAGE',
  'GEOFENCE_ENTER',
  'GEOFENCE_EXIT',
  'LOW_BATTERY',
  'IMMOBILITY',
  'LOST_SIGNAL',
  'FATIGUE',
  'OVER_EXPOSURE',
]);
export type AlertType = z.infer<typeof AlertType>;

export const AlertSeverity = z.enum(['info', 'low', 'medium', 'high', 'critical']);
export type AlertSeverity = z.infer<typeof AlertSeverity>;

export const AlertStatus = z.enum(['open', 'acknowledged', 'resolved', 'dismissed']);
export type AlertStatus = z.infer<typeof AlertStatus>;

export const Alert = z
  .object({
    id: Id,
    type: AlertType,
    severity: AlertSeverity,
    status: AlertStatus,
    siteId: Id,
    helmetId: Id,
    workerId: Id.nullable(),
    occurredAt: Iso8601,
    position: GeoPoint.nullable(),
    /** Texto descriptivo en es-CL. Ej: "Trabajador Juan Pérez salió de la zona segura Rajo 3". */
    message: z.string(),
    /**
     * Metadata específica al tipo. Preferimos `z.record(z.unknown())` en vez de
     * un union discriminado para no acoplar el contrato a cambios frecuentes;
     * los consumidores que necesiten validar profundo definen su propio schema.
     */
    metadata: z.record(z.unknown()).default({}),
    /** Quién acusó recibo y cuándo. */
    acknowledgedByUserId: Id.nullable(),
    acknowledgedAt: Iso8601.nullable(),
    resolvedByUserId: Id.nullable(),
    resolvedAt: Iso8601.nullable(),
    /** Notas del prevencionista al cerrar el evento. */
    resolutionNotes: z.string().nullable(),
  })
  .merge(AuditFields);
export type Alert = z.infer<typeof Alert>;
