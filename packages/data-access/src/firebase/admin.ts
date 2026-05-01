import { cert, getApp, getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * Admin SDK bundle — usado por el emulador Node.js y Cloud Functions.
 * En entorno local detecta los emuladores via las variables de ambiente
 * estándar de Firebase (`FIRESTORE_EMULATOR_HOST`, etc.); no se necesita
 * configuración extra.
 */
export interface AdminBundle {
  app: ReturnType<typeof getApp>;
  auth: ReturnType<typeof getAuth>;
  firestore: ReturnType<typeof getFirestore>;
  storage: ReturnType<typeof getStorage>;
}

export interface AdminOptions {
  projectId?: string;
  credentialPath?: string;
  storageBucket?: string;
}

export function initAdminFirebase(options: AdminOptions = {}): AdminBundle {
  if (!getApps().length) {
    const projectId = options.projectId ?? process.env.FIREBASE_PROJECT_ID ?? 'hela-dev';
    const init: Parameters<typeof initializeApp>[0] = {
      projectId,
      storageBucket: options.storageBucket ?? `${projectId}.appspot.com`,
    };
    if (options.credentialPath) {
      init.credential = cert(options.credentialPath);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      init.credential = applicationDefault();
    }
    // Contra emuladores no hace falta credential — Admin SDK detecta
    // FIRESTORE_EMULATOR_HOST y compañía automáticamente.
    initializeApp(init);
  }
  const app = getApp();

  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app),
  };
}
