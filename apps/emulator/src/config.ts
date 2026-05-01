import 'dotenv/config';

export const config = {
  projectId: process.env.FIREBASE_PROJECT_ID ?? 'hela-dev',
  siteId: process.env.EMULATOR_SITE_ID ?? 'chuqui',
  /** Cuántos trabajadores/cascos simular. */
  fleetSize: Number.parseInt(process.env.EMULATOR_FLEET_SIZE ?? '15', 10),
  /** Intervalo de telemetría por casco (ms). */
  telemetryIntervalMs: Number.parseInt(process.env.EMULATOR_TELEMETRY_MS ?? '3000', 10),
  /** Probabilidad por muestra de disparar una alerta aleatoria (0..1). */
  alertProbability: Number.parseFloat(process.env.EMULATOR_ALERT_PROB ?? '0.003'),
  /** Intervalo aproximado entre fotos por trabajador (ms). */
  photoIntervalMs: Number.parseInt(process.env.EMULATOR_PHOTO_MS ?? '120000', 10),
  /** Flag para saber si estamos apuntando a emuladores locales. */
  useEmulators:
    !!process.env.FIRESTORE_EMULATOR_HOST || !!process.env.FIREBASE_STORAGE_EMULATOR_HOST,
};

export type EmulatorConfig = typeof config;
