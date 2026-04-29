import { z } from 'zod';
import { AuditFields, GeoPoint, Id, Iso8601 } from './common.js';

/** Origen de la foto. */
export const PhotoSource = z.enum([
  'manual',       // Trabajador presionó el botón de captura
  'alert',        // Adjunta automáticamente a una alerta (SOS, caída)
  'scheduled',    // Captura periódica programada
  'supervisor',   // Solicitada remotamente por un supervisor
]);
export type PhotoSource = z.infer<typeof PhotoSource>;

/**
 * Foto tomada desde el casco. El archivo vive en Firebase Storage; aquí se
 * guarda solo la metadata. Las URLs firmadas se generan al vuelo en el cliente
 * para evitar links caducos.
 */
export const Photo = z
  .object({
    id: Id,
    helmetId: Id,
    workerId: Id.nullable(),
    siteId: Id,
    takenAt: Iso8601,
    source: PhotoSource,
    /** Path del archivo en Storage: `photos/{siteId}/{workerId}/{id}.jpg`. */
    storagePath: z.string(),
    /** Thumbnail WebP para la grilla (generado por Cloud Function). */
    thumbnailPath: z.string().nullable(),
    position: GeoPoint.nullable(),
    /** Dimensiones originales. */
    widthPx: z.number().int().positive().nullable(),
    heightPx: z.number().int().positive().nullable(),
    sizeBytes: z.number().int().positive().nullable(),
    /** Vinculada a una alerta si la fuente es 'alert'. */
    relatedAlertId: Id.nullable(),
  })
  .merge(AuditFields);
export type Photo = z.infer<typeof Photo>;
