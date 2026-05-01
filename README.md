# HELA — Plataforma de Seguridad Minera

Software chileno para la flota de cascos inteligentes **Grandtime H1 / H8**. Entrega al prevencionista de riesgos y al jefe de turno:

- Ubicación en vivo de cada trabajador en faena.
- Galería de fotografías tomadas desde el casco.
- Gráficas de tiempo de exposición por zona de riesgo.
- Alertas en tiempo real (SOS, hombre caído, casco fuera, alta tensión, salida de geocerca).
- Analítica de comportamiento para prevenir accidentes.
- Canal de ayuda inmediata ante un evento.

## Estructura

```
hela/
├── apps/
│   ├── landing/        Next.js 16 · Sitio de marketing (puerto 3001 en dev)
│   ├── dashboard/      Next.js 15 · Web del gerente/prevencionista (puerto 3000)
│   └── emulator/       Node.js   · Simula cascos H1/H8 hasta que llegue el hardware (jun-2026)
├── packages/
│   ├── contracts/      Tipos + Zod schemas compartidos (el "contrato" del casco)
│   └── data-access/    Interfaces de repositorio + implementación Firebase (swap-able)
├── functions/          Cloud Functions (agregaciones, geocercas, FCM)
├── firebase.json       Config de Firestore/Storage/Functions/Hosting
└── firestore.rules     Reglas de seguridad
```

El landing apunta a `http://localhost:3000/login` (el dashboard) en su botón de "Iniciar sesión" durante desarrollo. En producción se reemplaza por la URL del dominio del dashboard.

## Requisitos

- Node.js 20+
- pnpm 9+
- Firebase CLI (`pnpm dlx firebase-tools` o instalación global)
- Cuenta Firebase (proyecto por definir)

## Primeros pasos

```bash
pnpm install
cp .env.example .env.local           # completar claves de Firebase
pnpm firebase:emulators               # Firestore/Auth/Storage/Functions locales
pnpm dev:emulator                     # pushea telemetría ficticia
pnpm dev:dashboard                    # http://localhost:3000  (la web app)
pnpm dev:landing                      # http://localhost:3001  (el sitio de marketing)
```

## Decisiones arquitectónicas

1. **Monorepo pnpm + TypeScript estricto.** Un solo `pnpm install`, tipos compartidos entre cliente, servidor y emulador.
2. **Contracts package como fuente única de verdad.** Zod schema → type → validación runtime. El emulador, las Cloud Functions y el casco real (vía el agente Android) deben cumplir el mismo contrato.
3. **Data-access abstraído.** Hoy Firebase, mañana Postgres+PostGIS (cuando Codelco exija residencia en Chile). El dashboard no cambia.
4. **Firebase para MVP.** Firestore (live listeners), Storage (fotos), Auth (email+roles), Functions (agregaciones), Hosting, FCM (push). Emulator Suite para desarrollo sin red.
5. **Video en vivo fuera de Firebase.** Cuando llegue el hardware real, se introduce MediaMTX (SRT/WebRTC) como servicio aparte. El dashboard consume HLS/WebRTC — Firebase solo guarda metadata y thumbnails.

## Roadmap

- **M0 (hoy → viernes):** emulador + dashboard con mapa en vivo, alertas, galería, gráficas. Datos en Firebase.
- **M1 (mayo):** Cloud Functions de agregación, geocercas operativas, notificación push supervisor, autenticación por rol.
- **M2 (junio):** integración con casco H1/H8 real. Servidor MediaMTX. Pruebas de campo.
- **M3 (Q3 2026):** capa de residencia de datos en Chile (Postgres+PostGIS), integración SERNAGEOMIN, ACHS.
