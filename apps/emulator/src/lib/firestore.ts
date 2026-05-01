import { initAdminFirebase } from '@hela/data-access/firebase-admin';
import type {
  Alert,
  Crew,
  Geofence,
  Helmet,
  Photo,
  Site,
  TelemetrySample,
  Worker,
} from '@hela/contracts';
import { COLLECTIONS } from '@hela/contracts';
import { config } from '../config.js';

const admin = initAdminFirebase({ projectId: config.projectId });

export const db = admin.firestore;
export const storage = admin.storage;

/**
 * Mini repositorio de escritura para el emulador. Usa el Admin SDK y escribe
 * respetando el contrato Zod (sin validar aquí por performance — se asume
 * que las factories del escenario producen datos válidos).
 */
export const writer = {
  async upsertSite(site: Site) {
    await db.collection(COLLECTIONS.sites).doc(site.id).set(site, { merge: true });
  },
  async upsertCrew(crew: Crew) {
    await db.collection(COLLECTIONS.crews).doc(crew.id).set(crew, { merge: true });
  },
  async upsertWorker(worker: Worker) {
    await db.collection(COLLECTIONS.workers).doc(worker.id).set(worker, { merge: true });
  },
  async upsertHelmet(helmet: Helmet) {
    await db.collection(COLLECTIONS.helmets).doc(helmet.id).set(helmet, { merge: true });
  },
  async upsertGeofence(g: Geofence) {
    await db.collection(COLLECTIONS.geofences).doc(g.id).set(g, { merge: true });
  },
  async appendTelemetry(sample: TelemetrySample) {
    const id = sample.timestamp.replace(/[^0-9]/g, '').slice(0, 17);
    await db
      .collection(COLLECTIONS.helmets)
      .doc(sample.helmetId)
      .collection(COLLECTIONS.telemetry)
      .doc(id)
      .set(sample);
  },
  async updateHelmetLastSeen(
    helmetId: string,
    patch: Pick<Helmet, 'lastBatteryPct' | 'lastSignalDbm' | 'lastSeenAt' | 'connectivity'>,
  ) {
    await db
      .collection(COLLECTIONS.helmets)
      .doc(helmetId)
      .update({ ...patch, updatedAt: new Date().toISOString() });
  },
  async createAlert(alert: Alert) {
    await db.collection(COLLECTIONS.alerts).doc(alert.id).set(alert);
  },
  async createPhoto(photo: Photo) {
    await db.collection(COLLECTIONS.photos).doc(photo.id).set(photo);
  },
};
