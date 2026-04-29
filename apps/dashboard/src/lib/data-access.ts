'use client';

import { createFirestoreDataAccess } from '@hela/data-access/firebase';
import type { DataAccess } from '@hela/data-access';
import { getFirebase } from './firebase';

let cached: DataAccess | null = null;

export function getDataAccess(): DataAccess {
  if (cached) return cached;
  const { firestore, storage } = getFirebase();
  cached = createFirestoreDataAccess({ firestore, storage });
  return cached;
}
