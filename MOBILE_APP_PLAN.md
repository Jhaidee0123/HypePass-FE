# HypePass Mobile — Build Brief

**Propósito**: documento de contexto para empezar a construir la app móvil
de HypePass en una sesión futura. Léelo primero antes de hacer cualquier
cambio. Está diseñado para que un asistente nuevo (o yo en el futuro)
pueda arrancar sin reaprender todo desde cero.

**Última actualización**: 2026-04-28
**Estado**: planificación / no se ha escrito código todavía.

---

## 1. Contexto del producto

HypePass es una plataforma de ticketing multi-tenant en Colombia.
Repositorios existentes:

- `HypePass-BE` — NestJS 11 + PostgreSQL + TypeORM. Ya está en producción.
- `HypePass-FE` — React 18 + Webpack 5 + Recoil + SCSS Modules. Ya está
  en producción en `hypepass.co`.
- `HypePass-Mobile` — **NO existe todavía**. Este doc es para arrancarlo.

La app móvil es **complementaria**, no reemplaza el web. El web seguirá
siendo el panel completo del organizador y la página pública de eventos.
La app es solo para los dos flujos críticos en celular:

1. **Comprador**: ver y mostrar sus tickets en la puerta del evento.
2. **Staff de check-in**: escanear QRs en la puerta.

Todo lo demás (organizador, marketplace, admin, navegación pública,
checkout) se queda en el web.

---

## 2. Scope: solo dos flujos

### Lado del comprador (USER)

```
[Splash]
   → [Login (email + password)]
   → [Wallet — lista de mis tickets]
        ├── Tab "Próximos"
        └── Tab "Pasados"
   → [Detalle de ticket]
        ├── Cara visual del ticket (cover + título + fecha + sección)
        ├── QR rotativo (cada 30s)
        ├── Banner "QR no visible aún" si fuera de ventana
        ├── Estado "✓ Ingresaste" si ya hizo check-in
        └── Botón discreto "Ubicación del evento" → mapa nativo
[Settings]
   ├── Idioma (ES/EN)
   ├── Logout
   └── Versión de la app
```

**No incluido en la app del comprador (vive en web)**:
- Compra de tickets / checkout
- Transferir un ticket (al menos en MVP — agregar después)
- Vender en marketplace
- Ver eventos públicos / discovery
- Editar perfil

### Lado del staff (ADMIN / EVENT-STAFF)

```
[Splash]
   → [Login (email + password)]
   → [Detección automática de rol]
        - Si es event-staff de algún evento activo → modo scanner
        - Si solo es comprador → app del comprador
        - Si es ambos → toggle en el header
   → [Scanner]
        ├── Cámara con overlay de detección
        ├── Selector opcional "sesión esperada"
        ├── Resultado: ✓ ACEPTADO / ✗ RECHAZADO con motivo
        ├── Historial local de últimos 20 escaneos
        └── Toggle "Modo offline (sincronizar después)"  ← opcional v2
```

**No incluido**: ningún panel de organizador, ningún reporte de ventas,
ninguna acción admin de plataforma. Esos siguen en web.

---

## 3. Stack técnico recomendado

| Componente | Decisión | Por qué |
|---|---|---|
| Framework | **Expo (managed workflow)** | Iteración rápida, OTA updates, no necesitas Xcode/Android Studio para 90% del trabajo. |
| Lenguaje | TypeScript | Coherente con el resto del proyecto. |
| Navegación | `expo-router` (file-based) | Más moderno que `@react-navigation` puro, similar mental model a Next.js. |
| Estado | Recoil (mantener) o Zustand | Reusar el patrón del web. Recoil ya está probado en el FE. |
| HTTP | axios 0.26+ | Reusar el código de `data/usecases/remote-*.ts` casi 1:1. |
| Auth | Better Auth — usar `@better-auth/expo` o cookie sessions vía axios | Cookies funcionan en RN con `react-native-cookies`. |
| Cámara / QR | `expo-camera` + `expo-barcode-scanner` | Nativo, rápido, ya viene con permisos manejados. |
| Storage | `expo-secure-store` (auth token) + `@react-native-async-storage/async-storage` (cache) + opcional `react-native-mmkv` para perf | Secure store para datos sensibles, AsyncStorage para cache de tickets. |
| Push notifications | `expo-notifications` + Firebase / APNs | Gratis hasta cierto volumen. |
| Apple Wallet (v2+) | `expo-apple-wallet-ios` o módulo nativo custom | Para emitir `.pkpass` |
| Google Wallet (v2+) | `react-native-google-pay` o REST API | Para emitir pases nativos |
| i18n | `react-i18next` (mismo que el web) | **Reusar los `.json` de `HypePass-FE/src/main/i18n/locales/`** — copiar y mantener sincronizados. |
| Mapas (deep link) | `Linking.openURL()` con esquemas `comgooglemaps://`, `waze://`, `maps://` | No incrustar mapa en la app — abrir el nativo del usuario. |

**No usar**:
- React Native CLI puro (más fricción que Expo).
- Native modules custom en MVP (atrasa).
- Estado complejo tipo Redux Toolkit (overkill para 2 flujos).

---

## 4. Diseño visual: Pulse design system (heredado)

**Reusar 100% del sistema del web `HypePass-FE`**:

### Paleta (copiar de `src/presentation/styles/colors.scss`)
```
--ink-000:  #0a0908   (canvas / background base)
--ink-100:  #121110   (paneles oscuros)
--ink-200:  #1a1917   (cards / inputs)
--ink-300:  #242320   (bordes)
--ink-400:  #34312c   (bordes activos)
--ink-700:  #908b83   (texto muted)
--ink-800:  #bfbab1   (texto secundario)
--ink-1000: #faf7f0   (texto principal)

--lime:     #d7ff3a   (acento primario — CTAs, highlights, QR glow)
--magenta:  #ff2e93   (acento secundario — HOT/LIVE/RULE)
--success:  #5eeac7
--warn:     #ffb454
--danger:   #ff4d5a
```

### Tipografía
- **Display**: Bebas Neue (instalar `expo-font` y cargar el .ttf desde el repo del web).
- **Body**: Space Grotesk.
- **Labels / mono**: JetBrains Mono.

Las tres fuentes están en `HypePass-FE/public/fonts/` (verificar al
empezar; si no, descargarlas de Google Fonts).

### Componentes a portar de web (no copy-paste, redibujarlos en RN)

- `PulseButton` (variants: primary / secondary / ghost)
- `Logo` (versión SVG o PNG transparente — usar `main-logo-transparent.png`)
- `LanguageSwitcher`
- `Spinner`
- `ConfirmModal` / `PromptModal`
- `FeedbackModal`

Cada uno es un `<View>` + estilos, no se puede copiar el JSX del web
directamente porque RN usa `View`/`Text`/`Pressable` en vez de
`div`/`span`/`button`.

### Aesthetic checklist
- Background **siempre** `$ink-000`. Nada de blanco.
- Bordes finos `1px solid $ink-300`, hover/focus `$lime`.
- Texto en mayúsculas con tracking generoso (`letter-spacing: 0.12em`)
  para labels mono.
- Mínimo skeumorfismo. Plano, alto contraste, editorial.
- Animaciones: usar `react-native-reanimated` para microinteracciones
  (fade in del QR, pulse del scanner). Nada espectacular en MVP.

---

## 5. Arquitectura del proyecto

Misma Clean Architecture que el FE web:

```
HypePass-Mobile/
├── app/                          # expo-router file-based routes
│   ├── _layout.tsx               # RecoilRoot + i18n provider
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── reset-password.tsx
│   ├── (user)/                   # comprador
│   │   ├── _layout.tsx           # tabs: wallet | settings
│   │   ├── wallet/
│   │   │   ├── index.tsx
│   │   │   └── [ticketId].tsx
│   │   └── settings.tsx
│   ├── (staff)/                  # event-staff
│   │   └── checkin.tsx
│   └── splash.tsx
├── src/
│   ├── domain/                   # ← copiar de HypePass-FE
│   │   ├── usecases/
│   │   │   ├── authentication.ts
│   │   │   ├── wallet.ts
│   │   │   ├── checkin.ts
│   │   │   └── event-staff.ts
│   │   └── models/
│   │       ├── ticket.model.ts
│   │       ├── wallet.model.ts
│   │       └── ...
│   ├── data/                     # ← reusar `remote-*.ts` casi 1:1
│   │   ├── usecases/
│   │   └── protocols/
│   ├── infra/                    # storage, http (axios + interceptor)
│   │   ├── http/axios-http-client.ts
│   │   ├── storage/secure-storage.ts
│   │   └── storage/async-storage.ts
│   ├── main/
│   │   ├── factories/
│   │   ├── config/
│   │   │   └── app-config.ts     # ENDPOINT por stage
│   │   ├── i18n/
│   │   │   └── locales/          # ← copiar de HypePass-FE
│   │   └── adapters/
│   └── presentation/
│       ├── components/
│       ├── styles/
│       └── hooks/
├── app.json                      # config de Expo
├── eas.json                      # config de EAS Build
└── package.json
```

**Reglas**:
- `domain/` no importa nada de RN ni Expo. Tipos puros.
- `data/` solo importa `domain/` + axios. Igual al web.
- `infra/` es donde viven las cosas RN-específicas (Expo SecureStore, etc).
- `presentation/` consume RN/Expo libremente.
- `main/factories/` arman las inyecciones de dependencia, igual que en el web.

---

## 6. Endpoints que la app va a consumir

Todos contra `https://hypepass.co/api` (o `localhost:3000` en dev).
**Mismas APIs que ya usa el FE web — no hay que crear nada nuevo en BE
para el MVP.**

### Auth
- `POST /api/auth/sign-in/email` — login
- `POST /api/auth/sign-out` — logout
- `POST /api/auth/request-password-reset` — recuperar
- `GET /api/users/me` — sesión actual

### Wallet (comprador)
- `GET /api/wallet/tickets` — lista de tickets del usuario
- `GET /api/wallet/tickets/:ticketId` — detalle
- `GET /api/wallet/tickets/:ticketId/qr` — token QR firmado (TTL 60s)

### Check-in (staff)
- `POST /api/checkin/scan` — valida un token QR
- `GET /api/me/staff/events` — eventos donde soy staff (para detectar
  si el usuario es staff y mostrarle el modo scanner)

### NO se van a consumir desde la app (deja al web)
- `/api/checkout/*` — no se compra desde la app
- `/api/marketplace/*` — no se vende ni revende
- `/api/wallet/transfers` — no se transfiere (en MVP)
- `/api/companies/*`, `/api/admin/*`, `/api/organizer/*`, etc.

---

## 7. Sesión / Auth

Better Auth funciona con cookies en el FE web. En RN hay dos opciones:

**Opción A — Cookies con `react-native-cookies`** (más fiel al web):
- axios con `withCredentials: true`
- Las cookies se guardan automáticamente.
- BE no necesita cambios.

**Opción B — Token bearer almacenado en SecureStore** (más nativo):
- Login devuelve un token, lo guardas en `expo-secure-store`.
- axios interceptor agrega `Authorization: Bearer <token>` a cada request.
- Requiere endpoint `POST /api/auth/sign-in/email` que retorne el token,
  o un nuevo endpoint `POST /api/auth/exchange-cookie-for-token`.

**Recomendación**: arrancar con Opción A para no tocar el BE, migrar a
Opción B si encontramos friction en algún punto.

---

## 8. Estrategia offline (importante)

El cliente preguntó por eventos sin internet. La estrategia para la app:

### MVP (v1)
- **Wallet del comprador**: cachear el último ticket detail + QR en
  AsyncStorage. Si el usuario abre la app sin internet, ve la cara
  visual del ticket y un QR que dice "OFFLINE — última actualización
  HH:MM". Si el QR es de hace menos de 60s, sirve. Si es más viejo, el
  staff manualmente verifica con el nombre/email del comprador.
- **Scanner**: requiere internet en MVP. Si no hay, mostrar mensaje
  claro "Conéctate a internet para escanear".

### v2 (post-launch, alto impacto)
- Migrar el `QrTokenService` del BE de HMAC a **Ed25519** (firma
  asimétrica). Permite que el scanner valide tokens offline con la
  clave pública embebida.
- Modo offline del scanner: queue local de escaneos + sync al BE
  cuando vuelve la red. BE detecta duplicados y los marca para
  revisión.
- Background sync con `expo-background-fetch` para refrescar el QR
  cada N minutos cuando está cerca el evento.

Ver `CAPACITY_PLANNING.md` y la conversación previa para más contexto.

---

## 9. Push notifications (v2)

Casos de uso priorizados:
1. **"Tu QR está disponible"** — disparar cuando se cumpla el
   `qrVisibleFrom` de una sesión donde el usuario tiene ticket.
2. **"Te transfirieron un ticket"** — cuando un usuario recibe un transfer.
3. **"Tu evento es mañana / en 3 horas"** — recordatorios.
4. **"Tu ticket vendido en marketplace fue pagado"** — cuando settle ocurre.

Implementación: `expo-notifications` + endpoint nuevo en BE
`POST /api/notifications/devices` para registrar el push token del
device, y un cron que dispare en función de eventos próximos.

---

## 10. Apple Wallet / Google Wallet (v3, opcional)

No necesario para MVP ni v2. Es nice-to-have. Cuando llegue:

- Apple Wallet: emitir `.pkpass` firmado con certificado de Apple
  Developer ($99/año). Botón en el detalle del ticket "Add to Apple Wallet".
- Google Wallet: usar Google Wallet API. Es gratis pero requiere setup
  en Google Cloud.

Trade-off: el QR del pase nativo es estático (no rota). Hay que
decidir si emitirlo solo cerca del evento o aceptar el riesgo. Una
opción es emitirlo con TTL hasta 1h después del evento y aceptarlo
como "ticket válido pero menos seguro" en el scanner.

---

## 11. Plan de fases

### Phase 1 — Wallet del comprador (MVP)
**Tiempo estimado**: 4-6 semanas full-time.
- Splash + login + reset password
- Wallet listado + detalle
- QR rotativo (mismo flujo que el web)
- i18n ES/EN
- Cache offline básico de la última info
- Build de prueba en TestFlight + Internal Testing de Google Play

### Phase 2 — Scanner del staff
**Tiempo estimado**: +2-3 semanas.
- Detección de rol post-login
- Pantalla scanner con `expo-camera`
- Validación contra `/api/checkin/scan`
- Historial local
- Mensajes de error mapeados (NOT_EVENT_STAFF, STALE_TOKEN, etc.)

### Phase 3 — Offline scanner + push
**Tiempo estimado**: +3-4 semanas.
- Migración de HMAC a Ed25519 en BE (~1 semana, BE).
- Modo offline del scanner.
- Push notifications (registro + recibir).

### Phase 4 — Wallet nativo (opcional)
- Apple Wallet + Google Wallet.

### Phase 5 — Lanzamiento público
- Apple App Store: $99 USD/año, review ~1-7 días por release.
- Google Play: $25 USD una vez, review ~horas-días.
- Setup de EAS Build + EAS Submit (Expo).
- Política de privacidad y términos linkeados desde el listing.
- Screenshots, descripción, video preview.

---

## 12. Reuso del código del web

Cosas que **se pueden copiar casi 1:1** de `HypePass-FE`:

| Archivo / carpeta | ¿Se puede reusar? |
|---|---|
| `src/domain/usecases/*.ts` | **Sí, copy-paste.** Son interfaces puras. |
| `src/domain/models/*.ts` | **Sí, copy-paste.** |
| `src/data/usecases/remote-*.ts` | **Sí, casi 1:1.** Ajustar `axios` config para RN. |
| `src/main/i18n/locales/*.json` | **Sí, copy-paste.** Mantener sincronizados. |
| `src/validation/*` | **Sí, copy-paste.** Es framework propio sin dep web. |
| `src/presentation/styles/colors.scss` | **Sí, traducir a `colors.ts`** con los mismos hex. |
| `src/presentation/components/**/*.tsx` | **No.** Reescribir en RN (`View`/`Text`/`Pressable`). |
| `src/presentation/pages/**/*.tsx` | **No.** El layout cambia mucho de web a móvil. |
| Webpack config / public/* | **No.** No aplica a Expo. |

---

## 13. Decisiones abiertas (pendientes para la primera sesión)

1. **¿Expo managed o bare workflow?** Recomiendo managed; revisitar si
   necesitamos un native module que Expo no soporte.
2. **¿Mismo dominio API o separar?** Hoy es `hypepass.co/api`; la app
   móvil pega ahí mismo. Si la latencia es un issue, agregar un edge
   cache en Cloudflare.
3. **¿Dark mode forzado o seguir el sistema?** La marca es dark-only —
   forzar dark independientemente del sistema.
4. **¿Una sola app o dos (`HypePass` y `HypePass Staff`)?** Recomiendo
   **una sola app** con detección automática de rol después del login.
   Reduce surface area de mantenimiento, builds, marketing. Si en el
   futuro queremos separar, hacemos un fork de la versión Staff.
5. **¿Bundle id?** Reservar `co.hypepass.app` (iOS) y
   `co.hypepass.app` (Android) idealmente antes de empezar.
6. **¿Quién paga el Apple Developer Program?** $99 USD/año recurrente.

---

## 14. Cómo arrancar la primera sesión

Cuando estés listo para empezar a codear, en una sesión nueva di:

> "Mira `MOBILE_APP_PLAN.md` y arranca la fase 1 (wallet del comprador
> MVP). Crea el repo nuevo `HypePass-Mobile`, setea Expo + TypeScript +
> expo-router, configura el design system con las fuentes de Pulse, y
> arma el login + listado del wallet conectándote al BE de producción
> (`api.hypepass.co`)."

El asistente debería:
1. Leer este archivo entero.
2. Confirmar el stack y las decisiones abiertas.
3. Empezar por `npx create-expo-app HypePass-Mobile -t expo-template-blank-typescript`.
4. Setear estructura `src/{domain,data,infra,main,presentation}` igual al web.
5. Copiar archivos reusables de `HypePass-FE` (sección 12).
6. Setear `app-config.ts` con stages.
7. Implementar el login.
8. Implementar `wallet/index.tsx` con la lista.
9. Implementar `wallet/[ticketId].tsx` con el QR rotativo.

---

## 15. Referencias del codebase

Cuando necesites referencia del web para imitar:

- Login: `HypePass-FE/src/presentation/pages/login/login.tsx`
- Wallet listado: `HypePass-FE/src/presentation/pages/wallet/wallet.tsx`
- Ticket detail: `HypePass-FE/src/presentation/pages/wallet/ticket-detail.tsx`
- QR rotativo (lógica): mismo archivo arriba (`refreshQr` + `setInterval`)
- Scanner: `HypePass-FE/src/presentation/pages/checkin/checkin.tsx`
  + `qr-scanner.tsx`
- Auth client: `HypePass-FE/src/lib/auth-client.ts`
- Axios setup: `HypePass-FE/src/main/config/setup-axios-interceptors.ts`
- Brand specs: `HypePass-FE/CLAUDE.md` (sección "Sistema de diseño Pulse")

---

## 16. Costos estimados

### Desarrollo MVP completo (Phase 1 + 2)
- **Solo backend**: ~1 semana para migración HMAC → Ed25519 (Phase 3).
- **Mobile**: 6-9 semanas full-time para Phase 1 + 2.

### Recurrentes
- Apple Developer Program: **$99 USD/año**
- Google Play Developer: **$25 USD una vez**
- EAS Build (Expo): tier gratis es suficiente al inicio. Pago si
  superan ~30 builds/mes ($19 USD/mes).
- Push notifications: gratis hasta ~1M/mes vía Expo + Firebase.

### Una vez lanzada
- Mantenimiento: ~10% del tiempo de un dev. Cada release de iOS / Android
  requiere ~2 días entre build, review, fix, re-submit.

---

## 17. Anti-patterns / NO hacer

- **No reinventar el design system**: Pulse ya está definido y probado.
  Si una pantalla no se siente a marca, refactorizar.
- **No incrustar mapa interactivo en la app**: deeplink al mapa nativo
  (Google Maps, Waze, Apple Maps) — el usuario ya tiene el mapa
  preferido.
- **No mostrar SPLASH genérico de Expo**: configurar splash custom con
  el logo + lime aurora desde el primer commit.
- **No agregar features fuera del scope**: el web es el panel completo,
  la app son DOS flujos (wallet + scanner). Resistir el feature creep.
- **No cachear el secreto HMAC en el cliente**: si en algún momento se
  considera, NO. Migrar a Ed25519 antes.
- **No bloquear el flujo de wallet por geolocalización**: pedir
  permisos de ubicación es fricción innecesaria. Solo cámara para el
  scanner.
- **No olvidar el dark mode**: el OS modo claro no aplica — fuerza
  dark.

---

## 18. Estado al cierre de este doc

- ✅ Brand specs definidos (en CLAUDE.md del web).
- ✅ Backend con todos los endpoints que la app necesita.
- ✅ FE web completo con la lógica que se va a portar.
- ⏳ Decisión: cuándo arrancar (sin fecha definida).
- ⏳ Decisión: quién pagará Apple Developer Program.
- ⏳ Repo `HypePass-Mobile` no creado todavía.
- ⏳ EAS account no configurado.
- ⏳ Migración Ed25519 en BE pendiente (no bloqueante para MVP).

Cuando se decida arrancar, este doc es el punto de partida. La primera
sesión no debería tomar más de 2-3 horas para tener login + wallet
listado funcionando contra el BE existente.
