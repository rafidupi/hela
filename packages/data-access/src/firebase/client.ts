import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import {
  connectStorageEmulator,
  getStorage,
  type FirebaseStorage,
} from 'firebase/storage';

export interface ClientFirebaseBundle {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

export interface ClientFirebaseOptions extends FirebaseOptions {
  useEmulator?: boolean;
  emulatorHosts?: {
    auth?: string; // "http://localhost:9099"
    firestore?: { host: string; port: number };
    storage?: { host: string; port: number };
  };
}

/**
 * Inicializa el SDK de cliente (browser o Node.js SDK web). Idempotente:
 * reutiliza la app si ya fue creada.
 */
export function initClientFirebase(options: ClientFirebaseOptions): ClientFirebaseBundle {
  const app = getApps().length ? getApp() : initializeApp(options);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  if (options.useEmulator) {
    const e = options.emulatorHosts ?? {};
    try {
      connectAuthEmulator(auth, e.auth ?? 'http://localhost:9099', { disableWarnings: true });
    } catch {
      /* already connected */
    }
    try {
      const fs = e.firestore ?? { host: 'localhost', port: 8080 };
      connectFirestoreEmulator(firestore, fs.host, fs.port);
    } catch {
      /* already connected */
    }
    try {
      const st = e.storage ?? { host: 'localhost', port: 9199 };
      connectStorageEmulator(storage, st.host, st.port);
    } catch {
      /* already connected */
    }
  }

  return { app, auth, firestore, storage };
}
