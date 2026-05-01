import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Clock,
  Cog,
  FileText,
  HardHat,
  LayoutDashboard,
  LogOut,
  MapPin,
  Radar,
  ShieldAlert,
  Users,
  Video,
} from 'lucide-react';

export interface NavItemDef {
  href?: string;
  label: string;
  icon: LucideIcon;
  badge?: 'live' | number;
  /** When set, the item acts as a button instead of a link. */
  action?: 'logout';
  tone?: 'default' | 'danger';
}

export interface NavGroupDef {
  id: string;
  title?: string;
  items: NavItemDef[];
}

/**
 * Estructura del menú principal. Agrupado por dominio (no por importancia) —
 * así el prevencionista encuentra rápido lo que le sirve. El orden fue
 * validado contra los requisitos del jefe: ubicación, alertas, exposición,
 * prevención, ayuda inmediata.
 */
export const NAV_GROUPS: NavGroupDef[] = [
  {
    id: 'monitoreo',
    title: 'General',
    items: [
      { href: '/dashboard', label: 'Panel General', icon: LayoutDashboard },
      { href: '/mapa', label: 'Mapa en Vivo', icon: MapPin },
      { href: '/camaras', label: 'Cámaras', icon: Video },
      { href: '/trabajadores', label: 'Trabajadores', icon: Users },
      { href: '/cascos', label: 'Cascos', icon: HardHat },
    ],
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    items: [
      { href: '/exposicion', label: 'Exposición Ocupacional', icon: Radar },
      { href: '/incidentes', label: 'Historial de Incidentes', icon: Clock },
      { href: '/geocercas', label: 'Geocercas', icon: ShieldAlert },
    ],
  },
  {
    id: 'reportes',
    title: 'Reportes',
    items: [
      { href: '/reportes/sernageomin', label: 'SERNAGEOMIN', icon: FileText },
      { href: '/reportes/kpis', label: 'KPIs del Turno', icon: BarChart3 },
    ],
  },
  {
    id: 'admin',
    title: 'Administración',
    items: [
      { href: '/configuracion', label: 'Configuración', icon: Cog },
      { label: 'Cerrar sesión', icon: LogOut, action: 'logout', tone: 'danger' },
    ],
  },
];

export interface FooterItemDef {
  label: string;
  icon: LucideIcon;
  tone?: 'default' | 'danger';
  action: 'home' | 'logout';
}

export const FOOTER_ITEMS: FooterItemDef[] = [];
