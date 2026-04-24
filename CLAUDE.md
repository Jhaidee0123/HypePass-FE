# HypePass-FE — Guía de Arquitectura

Frontend React + TypeScript para **HypePass**. Clean Architecture estricta, bundler **Webpack 5**. Estado con **Recoil**, auth con **Better Auth**, estilos con **SCSS Modules**, i18n con **i18next**.

## Stack

- React 18 + TypeScript 5.5
- Webpack 5 (dev server en puerto **8090**). NO Vite / NO CRA.
- react-router-dom v6 (BrowserRouter + `<Outlet>` para la shell).
- Recoil 0.7 (estado cliente).
- Better Auth 1.5 + axios 0.26 (HTTP / sesión con cookies, `credentials: 'include'`).
- **i18next + react-i18next + i18next-browser-languagedetector** — ES default, EN via toggle.
- SCSS Modules (Dart Sass), **paleta Pulse** dark + lime + magenta.
- Path alias `@/*` → `src/*` (tsconfig + webpack).

## Regla de dependencias

```
Domain  ←  Data  ←  Infra  ←  Main  →  Presentation
```

- **domain/**: interfaces puras (use cases, models, errors). Sin dependencias.
- **data/**: implementaciones de use cases. Depende solo de `domain` y de `protocols/`.
- **infra/**: adaptadores (localStorage, http). Implementan `data/protocols/`.
- **main/**: composición — factories, routing, config, i18n, adapters, builders, proxies.
- **presentation/**: UI. Recibe use cases e interfaces por props — **nunca importa de `data/` o `infra/`**.
- **validation/**: framework propio (strategy + composite).

## Convenciones

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos | kebab-case | `remote-authentication.ts`, `login-factory.tsx` |
| Estilos | co-locados `<name>-styles.scss` | `login-styles.scss`, `nav-styles.scss` |
| Clases/Interfaces | PascalCase | `RemoteAuthentication`, `FieldValidation` |
| Hooks | `use<Name>` | `useLogout`, `useTranslation` |
| Atoms Recoil | sufijo `State` | `loginState`, `currentAccountState` |
| Factories | sufijo `-factory` | `login-factory.tsx` |
| Data use cases | prefijo `remote-` | `remote-authentication.ts` |
| Barrel exports | `index.ts` / `index.tsx` por carpeta | — |

## Sistema de diseño (Pulse)

- **Canvas**: negro profundo (`$ink-000` … `$ink-1000`).
- **Acento primario**: `$lime` (#d7ff3a) — CTAs, indicadores activos, highlights.
- **Acento secundario**: `$magenta` (#ff2e93) — badges HOT, live dot, precios fuera de rango.
- **Funcionales**: `$success` #5eeac7, `$warn` #ffb454, `$danger` #ff4d5a.
- **Fuentes**: `Bebas Neue` (display / títulos), `Space Grotesk` (body), `JetBrains Mono` (labels, códigos).
- **Responsive**: mixins `sm` (640) / `md` (768) / `lg` (1024) / `xl` (1280) / `xxl` (1400). Mobile-first.
- **Clases utilitarias globales** (definidas en `global.scss`): `.display`, `.mono`, `.upper`, `.grain` (noise overlay), `.hr-label`, `.pulse-dot`, `.ticket-notch`.
- **Tokens legacy** (`$primary`, `$textPrimary`, `$invalid`, ...) están mapeados a la paleta Pulse; `input/form-status/feedback-modal` siguen funcionando sin cambios.

### Componentes reutilizables listos (presentation/components)

- `Layout` — shell con Nav + `<main>` + Footer (usar vía `<Outlet>` en router).
- `Nav` — sticky, responsive, muestra links, usuario/avatar, language switcher.
- `Footer` — columnas + tagline + copyright.
- `Logo` — SVG HypePass (círculo lime).
- `LanguageSwitcher` — toggle `ES`/`EN` persistido en localStorage.
- `PulseButton` — variantes `primary` | `secondary` | `ghost`.
- `InputBase`, `FeedbackModal`, `FormStatusBase`, `Spinner` — existentes, re-themed.

## i18n

- Init en `src/main/i18n/i18n.ts`. Se importa en `main/index.tsx` **antes** de montar Router.
- Locales: `src/main/i18n/locales/es.json` (default), `en.json`.
- Detector: localStorage key `hypepass.language` → navigator → `es` fallback.
- En componentes: `const { t } = useTranslation(); t('auth.signIn')`.
- Claves agrupadas por sección: `common`, `nav`, `home`, `auth`, `dashboard`, `errors`.
- Para cambiar idioma desde código: `import { setLanguage } from '@/main/i18n/i18n'`.

**Regla**: cualquier string visible en UI debe salir de `t()`. Mantén nuevas claves en ambos archivos (`es.json` y `en.json`).

## Routing

- Dos grupos de rutas en `src/main/routes/router.tsx`:
  - **Fullscreen** (sin shell): `/login`, `/signup`. Tienen su propio layout oscuro centrado.
  - **Shell** (con `<Layout>`): `/`, `/marketplace`, `/wallet`, `/organizer`, `/dashboard`, `/admin`. Se componen vía `<Route element={<ShellOutlet/>}>` + `<Outlet/>`.
- Protecciones:
  - `PrivateRoute` — requiere sesión.
  - `AdminRoute` — requiere rol `platform_admin` (alineado con BE).

## Config de entorno

`REACT_APP_STAGE` = `local | dev | stage | prod` (default `local` → `http://localhost:3000`).
Editar URLs en `src/main/config/app-config.ts`. `wompiPublicKey` también se expone ahí.

## Autenticación

- Cliente Better Auth en `src/lib/auth-client.ts`. Cookies `credentials: 'include'`.
- Axios interceptor en `src/main/config/setup-axios-interceptors.ts` maneja 401 → limpia localStorage → redirige a `/login`.
- Estado de sesión en atom `currentAccountState` (Recoil), hidratado desde localStorage vía `current-account-adapter`.
- Hook `useLogout()` disponible en `@/presentation/hooks`.

## Playbook: crear una página nueva

1. `src/presentation/pages/<page>/<page>.tsx` — usa `useTranslation`, recibe use cases por props.
2. `<page>-styles.scss` co-locado. `import Styles from './...'`.
3. Si el form necesita estado, `components/atoms.ts` con el atom Recoil + subcomponentes en `components/`.
4. Export desde `src/presentation/pages/index.tsx`.
5. Factory en `src/main/factories/pages/<page>/<page>-factory.tsx`.
6. Ruta en `src/main/routes/router.tsx`. Decide si va dentro de `<ShellOutlet/>` (con nav/footer) o fullscreen.
7. Agrega las strings a `es.json` y `en.json`.

## Playbook: agregar endpoint/use case

1. Interfaz: `src/domain/usecases/<name>.ts`.
2. Impl: `src/data/usecases/remote-<name>.ts` — usa `HttpClient` (`data/protocols/http`) o `authClient`.
3. Factory: `src/main/factories/usecases/<name>/remote-<name>-factory.ts`.
4. Inyectar en la page factory → `<Page useCaseA={makeRemoteA()} />`.

## Playbook: componente UI

1. Crear carpeta `src/presentation/components/<component>/` con `<component>.tsx` + `<component>-styles.scss`.
2. Export default del componente + export nombrado en `src/presentation/components/index.tsx`.
3. Si son varios componentes relacionados (nav/footer son parte de layout), agrúpalos en subcarpeta (`layout/`).

## Wompi (cargado; uso en Iteración 6)

- Script del widget ya se incluye en `template.prod.html`:
  `<script src="https://checkout.wompi.co/widget.js"></script>`.
- Para dev, agrégalo en `template.dev.html` cuando uses el checkout, o cárgalo dinámicamente desde la page de checkout.
- `wompiPublicKey` vive en `app-config.ts` por stage.

## Scripts

```bash
yarn dev              # webpack-dev-server en :8090 (abre navegador)
yarn build            # build de producción
yarn lint / lint:fix
yarn test / test:watch / test:ci
```

## Gaps conocidos

- Tests aún sin escribir (Jest configurado vía `--passWithNoTests`).
- ESLint/Prettier: scripts presentes, sin config visible.
- No hay librería de componentes externa. Todo custom sobre el design system Pulse.
- `public/favicon.png` es un placeholder (11 bytes ASCII) — reemplazarlo con un PNG real antes del build de producción (plugin `favicons` falla con el stub actual).

## Archivos de referencia

- Entry: `src/main/index.tsx`
- Rutas: `src/main/routes/router.tsx`
- Config: `src/main/config/app-config.ts`
- i18n: `src/main/i18n/i18n.ts`, `locales/es.json`, `locales/en.json`
- Auth client: `src/lib/auth-client.ts`
- Shell: `src/presentation/components/layout/`
- Logo / Switcher / Botón: `src/presentation/components/{logo,language-switcher,pulse-button}/`
- Home: `src/presentation/pages/home/`
- Global styles / tokens: `src/presentation/styles/{colors,fonts,global,animations,mixins}.scss`

## Estado por iteración

- **Iteración 1 (BE)** hecha.
- **Iteración 2 (FE)** hecha — shell, i18n ES/EN, paleta Pulse/HypePass, Home nuevo, login/signup/dashboard re-themed, wiring al BE real (localhost:3000).
- **Iteración 3 (hecha)** — Organizer backoffice: `/organizer` index (listado compañías + eventos), `/organizer/companies/:cid/events/new` (crear), `/organizer/companies/:cid/events/:eid` (editor con sesiones/secciones/fases + media uploader). Use cases `OrganizerCompanies`, `OrganizerEvents`, `OrganizerVenues`, `OrganizerCategories`, `UploadImage`. Cloudinary via `POST /upload/image` (multipart).
- **Iteración 4 (hecha)** — Admin dashboard: `/admin` con tabs (eventos pendientes + compañías pendientes), `/admin/events/:eventId` drill-down read-only con aprobar/rechazar/publicar/despublicar + historial de reviews. Use case `AdminReview` consume `/api/admin/events/...` y `/api/admin/companies/...`.
- **Iteración 5 (hecha)** — Public discovery: `/` ahora es Discover (hero con evento destacado, filter bar con ciudad/fecha/categoría/sort, grid o list). `/events/:slug` nuevo con breadcrumb, hero, selector de sesión, selector de tier (con fase activa), cantidad, resumen y CTA a checkout (`/checkout?event=…` — stub para Iter 6). Use case `PublicEvents` contra `/api/public/events`.
- **Iteración 6 (hecha)** — Primary checkout + Wompi: `/checkout` fullscreen (lee URL params → form del comprador → `initiate` o `guest-initiate` → abre `WidgetCheckout` de Wompi cargado dinámicamente). `/checkout/result?ref=...` polling cada 3s a `GET /checkout/verify/:ref`. Si el user no está auth, enviamos email con credenciales desde el BE (guest flow). Use case `Checkout` contra `/api/checkout/*`.
- **Iteración 7 (hecha)** — Wallet + QR + Check-in: `/wallet` con tabs próximos/pasados, `/wallet/tickets/:id` con ticket-stub visual (cover + notch + QR via `react-qr-code`; QR oculto hasta `qrVisibleFrom` con aviso y fecha). QR rota cada 30s. Página `/checkin` (auth only) para staff — pega token + valida, muestra aceptado/razón de rechazo. Use cases `Wallet` y `Checkin` contra `/api/wallet/*` y `/api/checkin/*`.
- **Iteración 8 (hecha)** — Transfer: botón "Transferir" activado en `/wallet/tickets/:id`, abre `TransferModal` (email + nota opcional + confirmación en dos pasos). Use case `Transfer` contra `/api/wallet/tickets/:id/transfer` y `/api/wallet/transfers`.
- **Iteración 9 (hecha)** — Marketplace: `/marketplace` (grid de listings activos con imagen+fecha+sección+precio vs nominal), `/marketplace/listings/:listingId` (detail + buyer form + Wompi widget reusado). Modal "Vender" en `/wallet/tickets/:id` con price cap 1.2× face + breakdown (bruto/fee 10%/neto). Use case `Marketplace` contra `/api/marketplace/*` y `/api/wallet/listings/*`.
- **Iteración 10 Lote 2 (hecha) — UX hardening FE**:
  - Componentes reusables `ConfirmModal` + `PromptModal` en `@/presentation/components` (estilos compartidos `confirm-modal-styles.scss`, variantes `default`|`danger`).
  - `/admin` y `/admin/events/:id` reemplazaron `window.prompt`/`confirm` por los modales. `/admin` incluye input de búsqueda de texto (client-side).
  - Nav mobile con hamburger drawer — aparece bajo `md`, abre `<aside>` con links + switcher + auth.
  - Camera scanner en `/checkin` — `<QrScanner>` con `jsqr` + `<video>` (facing `environment`). Decode → auto-submit al BE. Fallback al input textual.
  - Paginación "Load more" en Discover — acumula resultados por página, muestra contador `count/total` + estado `allLoaded`.
  - Filter bar en `/marketplace` (search + sort por fecha/precio client-side).
  - `/admin/payouts` nueva: tabs por estado (`payable|pending|paid|failed|cancelled`), tarjetas con gross/fee/net, tres acciones con `ConfirmModal`. Use case `AdminPayouts`, factory `makeAdminPayouts()`.
- **Iteración 10 Lote 3 (hecha) — Nice-to-have FE**:
  - `SeoHelmet` reusable (`@/presentation/components`) con OpenGraph + Twitter Cards + canonical + soporte JSON-LD. Aplicado en `/` (`Organization`), `/events/:slug` (`Event` + `AggregateOffer` construido desde fases/secciones), `/marketplace` y `/marketplace/listings/:id` (`Event` + `Offer` single).
  - `WalletPage` con tabs nuevos: **"Mis ventas"** (`Marketplace.listMine`) y **"Transferidos"** (`Transfer.list`, combina sent+received). Lazy-load al seleccionar la tab. Factory pasa `marketplace` + `transfer`.
  - `Marketplace.updateListing(id, { askPrice, note })` + `RemoteMarketplace.updateListing` contra `PATCH /api/wallet/listings/:id`. Listo para modal de "editar precio" (por ahora expuesto sólo via use case — UI de edición queda para consolidar con otras acciones del seller en una iteración propia).
  - UI `/organizer/companies/:companyId/venues` — list + create + delete. Form con nombre, dirección, ciudad, región, país ISO-2, capacidad, descripción.
  - UI `/organizer/companies/:companyId/members` — list + add por email + select de rol. Links visibles en `/organizer` cuando la compañía está `active`.
  - `CreateCompanyForm` refactor completo a `Validation` (inyectado vía props). Nuevo validator `PatternValidation` + método `.slug()` en `ValidationBuilder`. Factory `makeCreateCompanyValidation`: required+min(2) en name, required+slug() en slug, email() opcional en contactEmail.
- Pendiente (siguiente iteración): edición inline de sesiones/secciones/fases en el event-editor (refactor grande), modal "editar precio" en `/wallet` sales tab.
