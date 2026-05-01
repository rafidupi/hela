import { initAdminFirebase } from '@hela/data-access/firebase-admin';
import { COLLECTIONS } from '@hela/contracts';
import type { AppUser } from '@hela/contracts';

export interface DemoUserSpec {
  email: string;
  password: string;
  displayName: string;
  role: AppUser['role'];
  siteIds: string[];
}

/**
 * Crea (o actualiza) un usuario en el Auth del emulador y su documento
 * correspondiente en Firestore. Idempotente: si ya existe, solo resetea
 * el password y el documento.
 */
export async function seedDemoUser(spec: DemoUserSpec): Promise<string> {
  const { auth, firestore } = initAdminFirebase();

  let uid: string;
  try {
    const existing = await auth.getUserByEmail(spec.email);
    uid = existing.uid;
    await auth.updateUser(uid, {
      password: spec.password,
      displayName: spec.displayName,
      emailVerified: true,
    });
  } catch {
    const created = await auth.createUser({
      email: spec.email,
      password: spec.password,
      displayName: spec.displayName,
      emailVerified: true,
    });
    uid = created.uid;
  }

  const now = new Date().toISOString();
  const doc: AppUser = {
    id: uid,
    email: spec.email,
    displayName: spec.displayName,
    role: spec.role,
    siteIds: spec.siteIds,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await firestore.collection(COLLECTIONS.users).doc(uid).set(doc, { merge: true });
  return uid;
}
