'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl, { type Map as MBMap } from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Moon, Mountain, Satellite, Sun, Sunrise, Sunset } from 'lucide-react';
import clsx from 'clsx';
import type { Geofence } from '@hela/contracts';
import type { LivePosition } from '@hela/data-access';

interface MapViewProps {
  center: { lat: number; lng: number };
  zoom?: number;
  positions: LivePosition[];
  geofences: Geofence[];
  selectedHelmetId: string | null;
  onSelectHelmet?: (helmetId: string | null) => void;
}

export type LightPreset = 'day' | 'dusk' | 'dawn' | 'night';

export interface MapStyleOption {
  id: string;
  label: string;
  icon: LucideIcon;
  styleUrl: string;
  /** Solo aplica al estilo Standard de Mapbox. */
  lightPreset?: LightPreset;
}

const STANDARD = 'mapbox://styles/mapbox/standard';

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: 'satellite-streets',
    label: 'Satélite',
    icon: Satellite,
    styleUrl: 'mapbox://styles/mapbox/satellite-streets-v12',
  },
  {
    id: 'outdoors',
    label: 'Topográfico',
    icon: Mountain,
    styleUrl: 'mapbox://styles/mapbox/outdoors-v12',
  },
  { id: 'standard-day', label: 'Día', icon: Sun, styleUrl: STANDARD, lightPreset: 'day' },
  { id: 'standard-dawn', label: 'Amanecer', icon: Sunrise, styleUrl: STANDARD, lightPreset: 'dawn' },
  { id: 'standard-dusk', label: 'Atardecer', icon: Sunset, styleUrl: STANDARD, lightPreset: 'dusk' },
  { id: 'standard-night', label: 'Noche', icon: Moon, styleUrl: STANDARD, lightPreset: 'night' },
];

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const DEFAULT_STYLE_ID = 'satellite-streets';

function severityColorHex(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#f43f5e';
    case 'high':
      return '#fb923c';
    case 'medium':
      return '#facc15';
    case 'low':
      return '#a3e635';
    default:
      return '#38bdf8';
  }
}

/**
 * Mapa Mapbox GL + capas de geocercas y trabajadores. El componente es
 * imperativo por detrás (SDK mutable) pero expone una API React-friendly.
 * El switcher flotante permite al usuario cambiar de basemap sin recargar.
 */
export function MapView({
  center,
  zoom = 13,
  positions,
  geofences,
  selectedHelmetId,
  onSelectHelmet,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MBMap | null>(null);
  const loadedStyleUrlRef = useRef<string | null>(null);
  const [styleId, setStyleId] = useState(DEFAULT_STYLE_ID);

  const currentStyle = MAP_STYLES.find((s) => s.id === styleId) ?? MAP_STYLES[0]!;

  // Init + teardown.
  useEffect(() => {
    if (!containerRef.current) return;
    if (!TOKEN) {
      console.warn('NEXT_PUBLIC_MAPBOX_TOKEN is missing. Map will not render.');
      return;
    }
    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: currentStyle.styleUrl,
      center: [center.lng, center.lat],
      zoom,
      attributionControl: false,
    });

    loadedStyleUrlRef.current = currentStyle.styleUrl;
    const onLoad = () => {
      applyLightPreset(map, currentStyle.lightPreset);
      installLayers(map);
      syncGeofences(map, geofences);
      syncWorkers(map, positions, selectedHelmetId);
    };

    map.on('load', onLoad);
    map.on('click', 'workers-circle', (e) => {
      const id = e.features?.[0]?.properties?.helmetId as string | undefined;
      if (id && onSelectHelmet) onSelectHelmet(id);
    });
    map.on('mouseenter', 'workers-circle', () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', 'workers-circle', () => (map.getCanvas().style.cursor = ''));

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cambiar de estilo. Dos casos:
  // 1. StyleUrl cambia (ej. Satélite → Topográfico): hay que recargar el
  //    estilo y reinstalar las capas. Después aplicar light preset si aplica.
  // 2. StyleUrl igual pero light preset diferente (ej. Día → Noche dentro
  //    de Standard): setStyle sería no-op; aplicar el preset directamente
  //    basta para que la iluminación cambie en vivo.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const sameStyle = loadedStyleUrlRef.current === currentStyle.styleUrl;
    if (sameStyle) {
      applyLightPreset(map, currentStyle.lightPreset);
      return;
    }
    loadedStyleUrlRef.current = currentStyle.styleUrl;
    map.setStyle(currentStyle.styleUrl);
    map.once('style.load', () => {
      applyLightPreset(map, currentStyle.lightPreset);
      installLayers(map);
      syncGeofences(map, geofences);
      syncWorkers(map, positions, selectedHelmetId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    syncGeofences(map, geofences);
  }, [geofences]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) syncWorkers(map, positions, selectedHelmetId);
    else map.once('load', () => syncWorkers(map, positions, selectedHelmetId));
  }, [positions, selectedHelmetId]);

  if (!TOKEN) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-slate-400 bg-surface-muted">
        Configurar <code className="mx-1 px-1 bg-surface rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> en .env.local
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* Style pill switcher — inactive items show icon only; active reveals its label. */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <StylePill activeId={styleId} onPick={setStyleId} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers imperativos sobre el SDK.
// ---------------------------------------------------------------------------

/**
 * Pill horizontal inspirado en el GNav del app Gasmy:
 * - Inactivos: solo ícono, gris.
 * - Activo: ícono + label, color brand, fondo tintado.
 * - Transición suave de ancho por CSS.
 */
/**
 * Pill estilo GNav (ver gasmy_repository/lib/screens/home_page.dart).
 *
 * Lógica del ancho constante:
 * - El activo tiene un ancho fijo grande (ICON + label). Muestra ambos.
 * - Cada inactivo tiene un ancho fijo chico (solo ICON).
 * - Como siempre hay exactamente 1 activo y N-1 inactivos, el ancho total
 *   de la pill es:  1 * ACTIVE_WIDTH + (N-1) * INACTIVE_WIDTH  — constante.
 *
 * Al cambiar de selección, el activo anterior encoge y el nuevo crece al
 * mismo tiempo; los íconos que quedaron en medio se deslizan suavemente.
 */
const ACTIVE_WIDTH = 120;
const INACTIVE_WIDTH = 40;

function StylePill({ activeId, onPick }: { activeId: string; onPick: (id: string) => void }) {
  return (
    <div className="panel flex items-center gap-1 p-1 rounded-full shadow-xl backdrop-blur-md bg-surface-elevated/90">
      {MAP_STYLES.map((s) => {
        const Icon = s.icon;
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            onClick={() => onPick(s.id)}
            aria-label={s.label}
            title={s.label}
            style={{ width: active ? ACTIVE_WIDTH : INACTIVE_WIDTH }}
            className={clsx(
              'h-9 flex items-center justify-center rounded-full shrink-0',
              'text-xs font-medium overflow-hidden',
              'transition-[width,background-color,color] duration-300 ease-out',
              active
                ? 'bg-brand-600/20 text-brand-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
            )}
          >
            <Icon size={16} className="shrink-0" />
            <span
              className={clsx(
                'whitespace-nowrap overflow-hidden',
                'transition-[max-width,opacity,margin-left] duration-300 ease-out',
                active ? 'max-w-[90px] opacity-100 ml-2 delay-100' : 'max-w-0 opacity-0 ml-0',
              )}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Aplica el light preset (día/amanecer/atardecer/noche) al basemap Standard.
 * Para estilos que no soportan `basemap` config (satélite, outdoors) el call
 * es silenciosamente ignorado por el SDK.
 */
function applyLightPreset(map: MBMap, preset: LightPreset | undefined): void {
  if (!preset) return;
  try {
    map.setConfigProperty('basemap', 'lightPreset', preset);
  } catch {
    /* style doesn't support basemap config — ignore */
  }
}

function installLayers(map: MBMap): void {
  // `slot: 'top'` coloca nuestras capas sobre todo lo del basemap Standard
  // (incluida la capa de iluminación que oscurece en modo noche).
  // `*-color-use-theme: 'none'` le dice a Mapbox que NO aplique el color
  // theme del light preset a estos colores — son absolutos.
  if (!map.getSource('geofences')) {
    map.addSource('geofences', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'geofences-fill',
      type: 'fill',
      slot: 'top',
      source: 'geofences',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.15,
        'fill-color-use-theme': 'none',
      },
    });
    map.addLayer({
      id: 'geofences-outline',
      type: 'line',
      slot: 'top',
      source: 'geofences',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 2,
        'line-color-use-theme': 'none',
      },
    });
  }
  if (!map.getSource('workers')) {
    map.addSource('workers', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'workers-circle',
      type: 'circle',
      slot: 'top',
      source: 'workers',
      paint: {
        'circle-radius': ['case', ['==', ['get', 'selected'], true], 10, 7],
        'circle-color': ['get', 'color'],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-color-use-theme': 'none',
        'circle-stroke-color-use-theme': 'none',
      },
    });
  }
}

function syncGeofences(map: MBMap, geofences: Geofence[]): void {
  const src = map.getSource('geofences') as mapboxgl.GeoJSONSource | undefined;
  if (!src) return;
  src.setData({
    type: 'FeatureCollection',
    features: geofences.map((g) => ({
      type: 'Feature',
      properties: {
        id: g.id,
        name: g.name,
        color: severityColorHex(g.severity),
        category: g.category,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [g.polygon.map((p) => [p.lng, p.lat])],
      },
    })),
  });
}

function syncWorkers(map: MBMap, positions: LivePosition[], selectedHelmetId: string | null): void {
  const src = map.getSource('workers') as mapboxgl.GeoJSONSource | undefined;
  if (!src) return;
  src.setData({
    type: 'FeatureCollection',
    features: positions.map((p) => ({
      type: 'Feature',
      properties: {
        helmetId: p.helmetId,
        workerId: p.workerId,
        color:
          p.connectivity === 'offline' ? '#64748b' : p.batteryPct < 20 ? '#f43f5e' : '#22c55e',
        selected: p.helmetId === selectedHelmetId,
      },
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
    })),
  });
}
