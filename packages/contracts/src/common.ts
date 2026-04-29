import { z } from 'zod';

/**
 * Tipos de valor comunes. Todos los timestamps viajan como ISO-8601 string en el
 * contrato para ser serializables a JSON, a Firestore y a un futuro Postgres.
 * El adaptador de data-access se encarga de convertir a Firestore Timestamp o
 * a Date cuando corresponda.
 */
export const Iso8601 = z.string().datetime({ offset: true });
export type Iso8601 = z.infer<typeof Iso8601>;

/** RUT chileno sin puntos, con dígito verificador ("12345678-9" o "12345678-K"). */
export const Rut = z
  .string()
  .regex(/^\d{7,8}-[0-9Kk]$/, 'RUT inválido (formato esperado 12345678-9)');
export type Rut = z.infer<typeof Rut>;

/** Coordenada geográfica WGS-84. */
export const GeoPoint = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof GeoPoint>;

/** Id de documento. Usamos string para no acoplarnos al tipo de clave de Firestore/Postgres. */
export const Id = z.string().min(1);
export type Id = z.infer<typeof Id>;

/** Auditoría mínima de todo documento persistido. */
export const AuditFields = z.object({
  createdAt: Iso8601,
  updatedAt: Iso8601,
});
export type AuditFields = z.infer<typeof AuditFields>;
