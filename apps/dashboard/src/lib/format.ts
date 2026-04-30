/** Utilidades de formato para es-CL. */

import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

export function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
}

export function shortDateTime(iso: string): string {
  return format(new Date(iso), "dd MMM HH:mm", { locale: es });
}

const ALERT_LABELS: Record<string, string> = {
  SOS: 'SOS',
  FALL: 'Caída',
  CAP_OFF: 'Casco fuera',
  HIGH_VOLTAGE: 'Alta tensión',
  GEOFENCE_ENTER: 'Entró a zona restringida',
  GEOFENCE_EXIT: 'Salió de zona segura',
  LOW_BATTERY: 'Batería baja',
  IMMOBILITY: 'Inmovilidad',
  LOST_SIGNAL: 'Sin señal',
  FATIGUE: 'Fatiga',
  OVER_EXPOSURE: 'Sobre-exposición',
};

export function alertLabel(type: string): string {
  return ALERT_LABELS[type] ?? type;
}

const SEVERITY_LABELS: Record<string, string> = {
  info: 'Informativa',
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

export function severityLabel(s: string): string {
  return SEVERITY_LABELS[s] ?? s;
}

export function severityColor(s: string): string {
  switch (s) {
    case 'critical':
      return 'bg-severity-critical text-white';
    case 'high':
      return 'bg-severity-high text-slate-900';
    case 'medium':
      return 'bg-severity-medium text-slate-900';
    case 'low':
      return 'bg-severity-low text-slate-900';
    default:
      return 'bg-severity-info text-slate-900';
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  safe: 'Zona segura',
  restricted: 'Zona restringida',
  exposure_dust: 'Polvo',
  exposure_noise: 'Ruido',
  exposure_height: 'Altura',
  exposure_voltage: 'Alta tensión',
  exposure_heat: 'Calor',
  exposure_gas: 'Gases',
};

export function categoryLabel(c: string): string {
  return CATEGORY_LABELS[c] ?? c;
}
