import { z } from 'zod';
import { GeoPoint, Id, Iso8601 } from './common.js';

/**
 * Una muestra de telemetría enviada por el casco. Se guarda como documento
 * append-only en una subcolección `helmets/{helmetId}/telemetry/{ts}`.
 *
 * Esquema alineado con los sensores disponibles en el H1/H8 según datasheet
 * Grandtime: GPS, barómetro, giroscopio, acelerómetro, brújula, luz,
 * batería, señal celular.
 */
export const TelemetrySample = z.object({
  helmetId: Id,
  workerId: Id.nullable(),
  timestamp: Iso8601,
  position: GeoPoint.nullable(),
  /** Exactitud GPS en metros. */
  accuracyM: z.number().min(0).nullable(),
  /** Altitud barométrica (m.s.n.m). Crítica en faenas sobre 3.000 m. */
  altitudeM: z.number().nullable(),
  /** Rumbo magnético en grados (0=Norte). */
  headingDeg: z.number().min(0).max(360).nullable(),
  /** Velocidad en m/s. */
  speedMps: z.number().min(0).nullable(),
  batteryPct: z.number().min(0).max(100),
  signalDbm: z.number().nullable(),
  /** G-sensor total (magnitud). Útil para detectar impactos. */
  accelG: z.number().nullable(),
  /** Temperatura interna del dispositivo en °C. */
  tempC: z.number().nullable(),
  /** Indicador binario: ¿el casco está puesto? (sensor de proximidad interno) */
  capOn: z.boolean().nullable(),
});
export type TelemetrySample = z.infer<typeof TelemetrySample>;
