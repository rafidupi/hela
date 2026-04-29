import { z } from 'zod';
import { AuditFields, Id, Rut } from './common.js';

/** Roles de usuario sobre el sistema (no confundir con `WorkerRole` abajo). */
export const UserRole = z.enum(['admin', 'manager', 'prevencionista', 'supervisor', 'viewer']);
export type UserRole = z.infer<typeof UserRole>;

/** Cargo del trabajador en faena. */
export const WorkerRole = z.enum([
  'operador_caex',
  'operador_pala',
  'operador_perforadora',
  'mecanico',
  'electricista',
  'jefe_turno',
  'supervisor',
  'prevencionista',
  'geologo',
  'topografo',
  'otro',
]);
export type WorkerRole = z.infer<typeof WorkerRole>;

/** Turno de trabajo (sistema 4x4 o 7x7 típico de minería chilena). */
export const Shift = z.enum(['A', 'B', 'C', 'D']);
export type Shift = z.infer<typeof Shift>;

export const Worker = z
  .object({
    id: Id,
    rut: Rut,
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: WorkerRole,
    crewId: Id,
    shift: Shift,
    siteId: Id,
    /** Casco actualmente asignado. Null si está descansando / fuera de turno. */
    assignedHelmetId: Id.nullable(),
    /** Foto de perfil en Firebase Storage (path, no URL). */
    avatarPath: z.string().nullable(),
    active: z.boolean(),
  })
  .merge(AuditFields);
export type Worker = z.infer<typeof Worker>;

/** Cuadrilla — agrupa trabajadores bajo un supervisor. */
export const Crew = z
  .object({
    id: Id,
    name: z.string().min(1),
    siteId: Id,
    supervisorWorkerId: Id.nullable(),
  })
  .merge(AuditFields);
export type Crew = z.infer<typeof Crew>;

/** Faena — Chuquicamata, El Teniente, Escondida, etc. */
export const Site = z
  .object({
    id: Id,
    name: z.string().min(1),
    /** Centro del mapa por defecto al abrir el dashboard. */
    center: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    defaultZoom: z.number().min(1).max(22),
    timezone: z.string().default('America/Santiago'),
  })
  .merge(AuditFields);
export type Site = z.infer<typeof Site>;
