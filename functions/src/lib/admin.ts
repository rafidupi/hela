import { initAdminFirebase } from '@hela/data-access/firebase-admin';

/** Single-ton del Admin SDK dentro del contenedor de Functions. */
export const admin = initAdminFirebase();
export const db = admin.firestore;
