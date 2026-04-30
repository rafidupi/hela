# QUICKSTART — Hela

## Prerequisitos

```bash
node -v   # v20+
corepack enable && corepack prepare pnpm@9.12.0 --activate
pnpm dlx firebase-tools --version   # Firebase CLI disponible
```

## Instalación

```bash
cd ~/Documents/hela
pnpm install
```

Si es la primera vez en esta máquina y no existe un proyecto Firebase, creá uno:

```bash
firebase login                        # usa bastian@gasmy.org
firebase projects:create hela-dev     # o el nombre que prefieras
firebase use hela-dev
```

Actualizá `.firebaserc` con el projectId real.

## Correr todo local (sin internet)

Usamos el Firebase Emulator Suite — Firestore, Auth, Storage, Functions corren en tu máquina.

Abrí **3 terminales**:

**Terminal 1 — Emuladores Firebase**
```bash
pnpm firebase:emulators
# UI de emuladores → http://localhost:4000
```

**Terminal 2 — Emulador de cascos (poblador de datos)**
```bash
# La primera vez:
# crea un usuario admin en el emulador Auth (UI http://localhost:4000/auth)
# o con curl — dejá uno con email prevencionista@hela.cl / demo1234
pnpm dev:emulator
# Verás: "⛑️  Hela Emulator — site=chuqui fleet=15"
# Y luego el seed + telemetría cada 3s para 15 trabajadores.
```

**Terminal 3 — Dashboard**
```bash
pnpm dev:dashboard
# → http://localhost:3000
# Login con prevencionista@hela.cl / demo1234
```

## Ajustes del demo para la reunión del viernes

Variables útiles en `apps/emulator/.env.local` (o heredadas de la shell):

- `EMULATOR_FLEET_SIZE=25` — más gente en el mapa.
- `EMULATOR_TELEMETRY_MS=2000` — movimiento más fluido.
- `EMULATOR_ALERT_PROB=0.02` — alertas más frecuentes (subir antes de demo).
- `EMULATOR_PHOTO_MS=60000` — fotos cada minuto.

Para disparar una alerta *en vivo* durante la demo, abrí la UI del emulador
Firebase → `alerts` → "Add document" y escribí una a mano, o agregá un
endpoint `/api/demo/trigger-sos` más adelante.

## Estructura rápida

- `apps/dashboard` — Next.js 15, mapa + alertas + drawer del trabajador.
- `apps/emulator` — Node que simula 15 cascos en Chuquicamata.
- `packages/contracts` — tipos compartidos (el "contrato" del casco).
- `packages/data-access` — interfaces de repositorio + impl Firebase.
- `functions` — Cloud Functions (geocercas, FCM, thumbnails).

## Cómo cambiar de Firebase a Postgres en el futuro

1. Crear `packages/data-access/src/postgres/` con implementaciones de las mismas interfaces (`WorkerRepository`, etc.).
2. Exportar un `createPostgresDataAccess(pool) => DataAccess`.
3. Cambiar `apps/dashboard/src/lib/data-access.ts` para usar el factory nuevo.
4. El dashboard, los hooks y los componentes **no cambian** — consumen `DataAccess`.

## Deploy (cuando estés listo)

```bash
pnpm build
firebase deploy --only hosting,firestore,functions,storage
```

## Troubleshooting

- `Error: EADDRINUSE` en los puertos del emulador → `lsof -i :8080` y matar.
- Dashboard muestra "Cargando…" para siempre → verificá que el emulador Auth esté corriendo y haya un usuario.
- Mapa en blanco → chequeá `NEXT_PUBLIC_MAP_STYLE_URL`.
