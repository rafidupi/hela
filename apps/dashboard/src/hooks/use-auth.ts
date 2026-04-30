'use client';

import {
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { getFirebase } from '@/lib/firebase';

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
} {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth } = getFirebase();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return {
    user,
    loading,
    async login(email, password) {
      const { auth } = getFirebase();
      await signInWithEmailAndPassword(auth, email, password);
    },
    async loginWithGoogle() {
      const { auth } = getFirebase();
      await signInWithPopup(auth, new GoogleAuthProvider());
    },
    async loginWithApple() {
      const { auth } = getFirebase();
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      await signInWithPopup(auth, provider);
    },
    async resetPassword(email) {
      const { auth } = getFirebase();
      await sendPasswordResetEmail(auth, email);
    },
    async logout() {
      const { auth } = getFirebase();
      await signOut(auth);
    },
  };
}
