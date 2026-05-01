import { z } from 'zod';
import { AuditFields, GeoPoint, Id } from './common.js';

/**
 * Categoría de zona. `safe` y `restricted` son semánticas de control;
 * las demás son zonas de *exposición* — el tiempo que un trabajador pasa
 * dentro cuenta para sus estadísticas de exposición ocupacional.
 */
export const GeofenceCategory = z.enum([
  'safe',             // Zona permitida; nadie debería recibir alerta al entrar
  'restricted',       // Prohibida — entrar dispara GEOFENCE_ENTER
  'exposure_dust',    // Polvo en suspensión (chancado primario, botaderos)
  'exposure_noise',   // Ruido elevado (harneros, chancadores)
  'exposure_height',  // Trabajo en altura (>1.8m)
  'exposure_voltage', // Cercanía a líneas energizadas
  'exposure_heat',    // Fundición, hornos
  'exposure_gas',     // Atmósfera con CO, SO2, NO2
]);
export type GeofenceCategory = z.infer<typeof GeofenceCategory>;

/**
 * Polígono 2D cerrado. Convención GeoJSON: el primer y último punto coinciden
 * cuando se persiste, pero permitimos ambas formas en el input y la capa
 * data-access normaliza.
 */
export const Polygon = z.array(GeoPoint).min(3);
export type Polygon = z.infer<typeof Polygon>;

export const Geofence = z
  .object({
    id: Id,
    siteId: Id,
    name: z.string().min(1),
    category: GeofenceCategory,
    polygon: Polygon,
    active: z.boolean(),
    /** Minutos máximos de exposición por turno antes de disparar OVER_EXPOSURE. */
    maxExposureMinutesPerShift: z.number().int().positive().nullable(),
    /** Nivel de severidad asignado a alertas generadas por esta geocerca. */
    severity: z.enum(['info', 'low', 'medium', 'high', 'critical']).default('medium'),
    description: z.string().nullable(),
  })
  .merge(AuditFields);
export type Geofence = z.infer<typeof Geofence>;
