/**
 * Mapa helmetId → URL de video demo. Mientras el hardware H1/H8 no esté
 * conectado al servidor MediaMTX, mostramos loops de videos en primera
 * persona como placeholder realista.
 *
 * Cómo se asigna:
 *  1. Lista de videos en `apps/dashboard/public/demo-videos/`.
 *  2. Hash determinístico del `helmetId` → índice del array → URL.
 *
 * Resultado: cada trabajador siempre ve su mismo video entre sesiones,
 * y si no hay videos disponibles volvemos al placeholder estático.
 *
 * Para agregar videos: dropearlos en `/public/demo-videos/` y sumar el
 * nombre al array DEMO_VIDEOS (no hay escaneo automático — Next no lo
 * permite en cliente). Archivos deben ser .mp4 H.264 + AAC.
 */
export const DEMO_VIDEOS: string[] = [
  // Ejemplo — reemplazar con los nombres reales cuando los dropees:
  // 'pov-1.mp4',
  // 'pov-2.mp4',
  // 'pov-3.mp4',
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Devuelve la URL del video asignado al casco, o null si no hay videos
 * disponibles (en cuyo caso el caller debe mostrar el placeholder estático).
 */
export function getDemoVideoUrlForHelmet(helmetId: string): string | null {
  if (DEMO_VIDEOS.length === 0) return null;
  const idx = hashString(helmetId) % DEMO_VIDEOS.length;
  return `/demo-videos/${DEMO_VIDEOS[idx]}`;
}
