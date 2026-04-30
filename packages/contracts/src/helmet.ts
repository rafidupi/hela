import { z } from 'zod';
import { AuditFields, Id, Iso8601 } from './common.js';

/** Modelos de casco Grandtime soportados. */
export const HelmetModel = z.enum(['H1', 'H8']);
export type HelmetModel = z.infer<typeof HelmetModel>;

/** Estado de conectividad del casco con el backend. */
export const HelmetConnectivity = z.enum(['online', 'degraded', 'offline']);
export type HelmetConnectivity = z.infer<typeof HelmetConnectivity>;

/**
 * Casco físico. Representa el dispositivo, no al trabajador. El mapeo
 * casco↔trabajador se hace vía `Worker.assignedHelmetId` y también se refleja
 * acá con `currentWorkerId` (desnormalizado para consultas rápidas).
 */
export const Helmet = z
  .object({
    id: Id,
    model: HelmetModel,
    serialNumber: z.string().min(1),
    /** IMEI del módulo celular — clave para soporte técnico en faena. */
    imei: z.string().nullable(),
    siteId: Id,
    currentWorkerId: Id.nullable(),
    /** Última lectura conocida (desnormalizada para evitar N+1 en el mapa). */
    lastBatteryPct: z.number().min(0).max(100).nullable(),
    lastSignalDbm: z.number().nullable(),
    lastSeenAt: Iso8601.nullable(),
    connectivity: HelmetConnectivity,
    firmwareVersion: z.string().nullable(),
    active: z.boolean(),
  })
  .merge(AuditFields);
export type Helmet = z.infer<typeof Helmet>;
