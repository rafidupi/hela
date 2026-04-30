'use client';

/**
 * El MVP asume un único site. Cuando el usuario pertenezca a múltiples
 * faenas, este hook leerá el seleccionado desde localStorage / URL.
 */
export function useCurrentSiteId(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_SITE_ID ?? 'chuqui';
}
