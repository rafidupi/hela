'use client';

import { useEffect, useState } from 'react';
import type { Subscribable } from '@hela/data-access';

/**
 * Puente entre el contrato `Subscribable<T>` de data-access y un hook React.
 * Aísla al componente de detalles de Firestore/Postgres/cualquier backend.
 */
export function useSubscribable<T>(
  factory: () => Subscribable<T> | null,
  deps: ReadonlyArray<unknown>,
  initial: T,
): { value: T; error: Error | null } {
  const [value, setValue] = useState<T>(initial);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const sub = factory();
    if (!sub) return;
    const unsub = sub.subscribe(
      (v) => {
        setValue(v);
        setError(null);
      },
      (e) => setError(e),
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { value, error };
}
