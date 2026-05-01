import type { Crew, Geofence, Helmet, Site, Worker } from '@hela/contracts';

/**
 * Escenario base: Chuquicamata, mina de rajo abierto de Codelco. Coordenadas
 * reales del centro del rajo. Las geocercas son ficticias pero con forma
 * creíble y categorías variadas para demo.
 */
export const CHUQUI_CENTER = { lat: -22.2975, lng: -68.9006 };

const now = () => new Date().toISOString();

export function buildSite(siteId: string): Site {
  return {
    id: siteId,
    name: 'Chuquicamata — Rajo',
    center: CHUQUI_CENTER,
    defaultZoom: 14,
    timezone: 'America/Santiago',
    createdAt: now(),
    updatedAt: now(),
  };
}

export function buildCrews(siteId: string): Crew[] {
  return [
    { id: 'crew-001', name: 'Cuadrilla Alfa', siteId, supervisorWorkerId: null, createdAt: now(), updatedAt: now() },
    { id: 'crew-002', name: 'Cuadrilla Bravo', siteId, supervisorWorkerId: null, createdAt: now(), updatedAt: now() },
    { id: 'crew-003', name: 'Cuadrilla Charlie', siteId, supervisorWorkerId: null, createdAt: now(), updatedAt: now() },
  ];
}

/** Nombres típicos chilenos para realismo en la demo. */
const FIRST = [
  'Juan',
  'Pedro',
  'Cristián',
  'Ricardo',
  'Víctor',
  'Rodrigo',
  'Felipe',
  'Matías',
  'Sebastián',
  'Carlos',
  'Luis',
  'María',
  'Camila',
  'Francisca',
  'Andrea',
];

const LAST = [
  'González',
  'Muñoz',
  'Rojas',
  'Díaz',
  'Pérez',
  'Soto',
  'Contreras',
  'Silva',
  'Martínez',
  'Sepúlveda',
  'Morales',
  'Aravena',
  'Reyes',
  'Castro',
  'Fuentes',
];

const ROLES = ['operador_caex', 'operador_pala', 'mecanico', 'electricista', 'topografo'] as const;
const SHIFTS = ['A', 'B', 'C'] as const;

function formatRut(n: number): string {
  // Simula un RUT 12.345.678-K con dígito verificador calculado (módulo 11).
  let M = 0;
  let S = 1;
  let T = n;
  while (T) {
    S = (S + (T % 10) * (9 - (M++ % 6))) % 11;
    T = Math.floor(T / 10);
  }
  const dv = S ? String(S - 1) : 'K';
  return `${n}-${dv}`;
}

export function buildFleet(siteId: string, size: number): { workers: Worker[]; helmets: Helmet[] } {
  const workers: Worker[] = [];
  const helmets: Helmet[] = [];
  const crews = ['crew-001', 'crew-002', 'crew-003'];

  for (let i = 0; i < size; i++) {
    const workerId = `w-${String(i + 1).padStart(3, '0')}`;
    const helmetId = `h-${String(i + 1).padStart(3, '0')}`;
    const first = FIRST[i % FIRST.length]!;
    const last = LAST[(i * 3) % LAST.length]!;
    const role = ROLES[i % ROLES.length]!;
    const shift = SHIFTS[i % SHIFTS.length]!;
    const crewId = crews[i % crews.length]!;
    const model = i % 3 === 0 ? 'H8' : 'H1';

    workers.push({
      id: workerId,
      rut: formatRut(12000000 + i * 137),
      firstName: first,
      lastName: last,
      role,
      crewId,
      shift,
      siteId,
      assignedHelmetId: helmetId,
      avatarPath: null,
      active: true,
      createdAt: now(),
      updatedAt: now(),
    });

    helmets.push({
      id: helmetId,
      model,
      serialNumber: `GT-${model}-${String(i + 1).padStart(5, '0')}`,
      imei: `86${String(1000000000 + i * 17).padStart(13, '0')}`,
      siteId,
      currentWorkerId: workerId,
      lastBatteryPct: 95 - (i % 20),
      lastSignalDbm: -75 - (i % 10),
      lastSeenAt: now(),
      connectivity: 'online',
      firmwareVersion: model === 'H8' ? '2.1.4' : '1.8.12',
      active: true,
      createdAt: now(),
      updatedAt: now(),
    });
  }
  return { workers, helmets };
}

/**
 * Geocercas ficticias alrededor del centro de Chuquicamata. Polígonos simples
 * que aproximan áreas del rajo, chancado, botadero, subestación.
 */
export function buildGeofences(siteId: string): Geofence[] {
  const { lat, lng } = CHUQUI_CENTER;
  const box = (dx: number, dy: number, size: number) => [
    { lat: lat + dy, lng: lng + dx },
    { lat: lat + dy, lng: lng + dx + size },
    { lat: lat + dy + size, lng: lng + dx + size },
    { lat: lat + dy + size, lng: lng + dx },
  ];

  return [
    {
      id: 'gf-rajo-safe',
      siteId,
      name: 'Perímetro operacional',
      category: 'safe',
      polygon: box(-0.025, -0.02, 0.05),
      active: true,
      maxExposureMinutesPerShift: null,
      severity: 'info',
      description: 'Zona permitida para personal autorizado.',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'gf-chancado',
      siteId,
      name: 'Chancado primario',
      category: 'exposure_dust',
      polygon: box(0.002, 0.002, 0.006),
      active: true,
      maxExposureMinutesPerShift: 240,
      severity: 'medium',
      description: 'Exposición a polvo respirable. Uso obligatorio de media máscara.',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'gf-harneros',
      siteId,
      name: 'Harneros',
      category: 'exposure_noise',
      polygon: box(-0.008, 0.004, 0.005),
      active: true,
      maxExposureMinutesPerShift: 480,
      severity: 'low',
      description: 'Ruido >85 dB(A). Protección auditiva obligatoria (PREXOR).',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'gf-subestacion',
      siteId,
      name: 'Subestación eléctrica 220kV',
      category: 'exposure_voltage',
      polygon: box(-0.015, -0.012, 0.004),
      active: true,
      maxExposureMinutesPerShift: null,
      severity: 'high',
      description: 'Proximidad a líneas energizadas. Solo personal eléctrico certificado.',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'gf-botadero-este',
      siteId,
      name: 'Botadero Este — Restringido',
      category: 'restricted',
      polygon: box(0.012, -0.015, 0.008),
      active: true,
      maxExposureMinutesPerShift: null,
      severity: 'critical',
      description: 'Zona inestable. Acceso prohibido sin autorización del jefe de turno.',
      createdAt: now(),
      updatedAt: now(),
    },
  ];
}
