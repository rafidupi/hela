import { z } from 'zod';
import { AuditFields, Id } from './common.js';
import { UserRole } from './worker.js';

/**
 * Usuario del dashboard (gerente, prevencionista, supervisor). Distinto de
 * `Worker` — un supervisor *puede* ser además un trabajador con casco, pero
 * típicamente son entidades separadas.
 */
export const AppUser = z
  .object({
    id: Id, // coincide con Firebase Auth UID
    email: z.string().email(),
    displayName: z.string().min(1),
    role: UserRole,
    siteIds: z.array(Id),
    active: z.boolean(),
  })
  .merge(AuditFields);
export type AppUser = z.infer<typeof AppUser>;
