'use client';

import { initClientFirebase } from '@hela/data-access/firebase';
import type { ClientFirebaseBundle } from '@hela/data-access/firebase';

let cached: ClientFirebaseBundle | null = null;

/**
 * Inicializa Firebase en el browser. Lazy + singleton — nunca corre en el
 * servidor (Next.js server components no deben llamar esto).
 */
export function getFirebase(): ClientFirebaseBundle {
  if (cached) return cached;

  cached = initClientFirebase({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'demo',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'hela-dev.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'hela-dev',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'hela-dev.appspot.com',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    useEmulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true',
  });
  return cached;
}
