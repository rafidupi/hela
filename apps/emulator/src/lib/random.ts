export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randint(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

export function pick<T>(arr: readonly T[]): T {
  const v = arr[Math.floor(Math.random() * arr.length)];
  if (v === undefined) throw new Error('pick() on empty array');
  return v;
}

export function coin(p = 0.5): boolean {
  return Math.random() < p;
}

/** Camina una posición en una dirección pseudo-persistente. */
export function walk(
  lat: number,
  lng: number,
  headingDeg: number,
  speedMps: number,
  dtSec: number,
): { lat: number; lng: number; headingDeg: number } {
  // Perturbamos ligeramente el rumbo para que parezca humano.
  const newHeading = (headingDeg + rand(-20, 20) + 360) % 360;
  const rad = (newHeading * Math.PI) / 180;
  const meters = speedMps * dtSec;
  // 1° lat ≈ 111_320 m; 1° lng ≈ 111_320 * cos(lat).
  const dLat = (meters * Math.cos(rad)) / 111_320;
  const dLng = (meters * Math.sin(rad)) / (111_320 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lng: lng + dLng, headingDeg: newHeading };
}

/** Punto-en-polígono simple (ray casting). Polígono como array de {lat,lng}. */
export function pointInPolygon(
  p: { lat: number; lng: number },
  polygon: readonly { lat: number; lng: number }[],
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]!;
    const pj = polygon[j]!;
    const intersect =
      pi.lng > p.lng !== pj.lng > p.lng &&
      p.lat < ((pj.lat - pi.lat) * (p.lng - pi.lng)) / (pj.lng - pi.lng) + pi.lat;
    if (intersect) inside = !inside;
  }
  return inside;
}
