/**
 * Contrato mínimo de suscripción en vivo. El dashboard nunca sabe si por detrás
 * hay un onSnapshot de Firestore, un WebSocket, o un Postgres LISTEN/NOTIFY.
 */
export type Unsubscribe = () => void;

export type Subscriber<T> = (value: T) => void;

export interface Subscribable<T> {
  subscribe(onChange: Subscriber<T>, onError?: (err: Error) => void): Unsubscribe;
}
