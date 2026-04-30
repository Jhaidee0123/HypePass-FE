# HypePass — Payments Status & Resume Guide

**Última actualización**: 2026-04-30
**Documento padre**: `PAYMENTS_HYBRID_PLAN.md` (plan original)
**Propósito**: snapshot de lo que está **listo, listo para deploy, y pendiente**
en el sistema de pagos. Este archivo es el **punto de entrada** para retomar el
trabajo en una sesión futura.

---

## TL;DR — Estado por fase

| Fase | Estado | Notas |
|---|---|---|
| **Fase 1 — Wompi Payouts (SPT)** | ✅ Code complete, deployable | Falta solo activar Wompi SPT comercialmente |
| **Fase 2 — MercadoPago Split** | 🟡 Foundations en código (BE), feature-flagged OFF | Requiere empresa constituida + cuenta MP |
| **Fase 3 — Migración gradual** | ⏳ Sin empezar | Después de Fase 2 |

**Decisión actual del usuario**: pausar Fase 2 hasta tener empresa registrada
en cámara de comercio. Operar con Fase 1 (Wompi + Wompi Payouts) mientras
tanto.

---

## Estado del código (qué se hizo en este sprint)

### ✅ FASE 1 — Wompi Payouts (LISTA PARA DEPLOY)

**Backend** (`HypePass-BE`):
- `src/payments/infrastructure/services/wompi-payouts.service.ts` —
  adapter para Wompi SPT (Pagos a Terceros). Métodos:
  - `listBanks()` con cache 24h
  - `dispersePayment(input)` → `POST /payouts`
  - `getPayoutStatus(id)` → `GET /payouts/:id`
  - Feature flag `WOMPI_PAYOUTS_ENABLED` para activar gradual
- `src/marketplace/application/use-case/disperse-payout.usecase.ts` —
  toma un PayoutRecord PAYABLE, valida método de pago del seller,
  llama a Wompi, marca PAID o FAILED. Snapshot del payout method al
  momento de dispersar.
- `src/sweepers/disperse-payouts.sweeper.ts` — corre cada hora,
  procesa máximo 50 records `PAYABLE`, secuencial. Doble flag
  (`SWEEPER_ENABLED` + `WOMPI_PAYOUTS_ENABLED`).
- `src/marketplace/application/use-case/list-my-payouts.usecase.ts` —
  para que organizadores vean su historial. Endpoint `GET /me/payouts`.
- `src/payout-methods/infrastructure/controllers/profile-payout-methods.controller.ts` —
  endpoint nuevo `GET /profile/payout-methods/banks` proxy al catálogo
  Wompi.
- Audit actions nuevas: `payout.dispersed`, `payout.dispersion_failed`.
- `PayoutRecord` extendido con `providerName`, `providerReference`,
  `failureReason`.
- `PayoutMethod` extendido con `wompiBankId` (UUID Wompi),
  `accountType` ('AHORROS' | 'CORRIENTE').

**Frontend** (`HypePass-FE`):
- Tipos `PayoutMethod` con `wompiBankId` y `accountType`. `PayoutBank`.
- `RemotePayoutMethods.listBanks()` consume el endpoint nuevo.
- Form de payout method (`payout-methods-section.tsx`):
  - Lazy-fetch del catálogo de bancos al abrir el form.
  - Dropdown "Banco" para tipos bancarios. Fallback a input manual si
    Wompi devuelve vacío (ej. `WOMPI_PAYOUTS_ENABLED=false`).
  - Selector AHORROS/CORRIENTE para tipos genéricos. Auto-derivado
    para Bancolombia ahorros/corriente.
- Página nueva `/organizer/payouts` ("Mis liquidaciones") con cards,
  badge de status coloreado, monto destacado, info de cuenta destino
  enmascarada y `failureReason` cuando aplica.
- Shortcut card "Mis liquidaciones" en el panel de organizador.
- i18n ES/EN: bloques `organizer.myPayouts.*`, `organizer.shortcuts.payouts.*`,
  `profile.payoutMethods.fields.{bank,bankIdPlaceholder,accountType,accountTypeAhorros,accountTypeCorriente}`.

**Env vars (en `.env.example`)**:
```bash
WOMPI_PAYOUTS_API_URL=https://api.wompi.co/v1
WOMPI_PAYOUTS_PRIVATE_KEY=
WOMPI_PAYOUTS_ORIGIN_ACCOUNT_ID=
WOMPI_PAYOUTS_ENABLED=false
PAYOUT_DISPERSION_BATCH_SIZE=50
```

### 🟡 FASE 2 — MercadoPago Split (FOUNDATIONS, feature-flagged OFF)

**Backend** (`HypePass-BE`):
- `src/shared/infrastructure/services/crypto.service.ts` — AES-256-GCM
  con key de env (`PAYMENT_CRED_ENCRYPTION_KEY`). Encripta/desencripta
  tokens en DB. Falla limpio si no hay key.
- Tabla `company_payment_gateway_credentials` — entity, ORM, mapper,
  service. UNIQUE `(company_id, gateway)`. Tokens encriptados.
- `src/payments/infrastructure/services/mercadopago.service.ts` —
  implementa `PaymentGatewayPort`:
  - `getPublicKey(ctx)` retorna la public key del SELLER (no la nuestra)
  - `generateSignature` crea preference de MP con `marketplace_fee` y
    devuelve el `preference_id`
  - `verifyWebhookSignature` HMAC del header `x-signature`
  - Feature flag `MERCADOPAGO_ENABLED` — todos los métodos throw cuando
    está OFF (loud failure)
- `src/payments/application/services/mercadopago-oauth.service.ts` —
  `buildAuthorizeUrl`, `exchangeCode`, `refresh`, `signState/verifyState`
  (HMAC para tying state a companyId).
- 3 use cases: `MpConnectUseCase`, `MpDisconnectUseCase`,
  `ListCompanyPaymentGatewaysUseCase`.
- `PaymentGatewayRegistry` — resuelve adapter por nombre. Default
  fallback a Wompi.
- `MercadoPagoOAuthController`:
  - `GET /companies/:c/payments/gateways` — status de cada gateway
  - `GET /companies/:c/payments/mp/authorize` — redirect a MP authorize URL
  - `GET /payments/mp/callback?code&state` — público (`@AllowAnonymous`),
    intercambia code → tokens, redirige a `/organizer/companies/:c/payments?mp_connected=1`
  - `POST /companies/:c/payments/mp/disconnect`
- `PaymentGatewayPort` generalizado: `name: PaymentGatewayName`,
  `GatewayContext { companyId?, applicationFeeAmount? }` opcional, todo
  async. **Wompi sigue funcionando idéntico** porque ignora el context.
- `companies.preferredGateway` columna nueva, default `'wompi'`. Entity,
  props, mapper actualizados.
- `orders.applicationFeeAmount` columna nueva, nullable. Entity, props,
  mapper actualizados.
- 2 audit actions: `payment.gateway_connected`,
  `payment.gateway_disconnected`.

**Env vars (en `.env.example`)**:
```bash
MERCADOPAGO_API_URL=https://api.mercadopago.com
MERCADOPAGO_CLIENT_ID=
MERCADOPAGO_CLIENT_SECRET=
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_REDIRECT_URI=https://api.hypepass.co/api/payments/mp/callback
MERCADOPAGO_WEBHOOK_SECRET=
MERCADOPAGO_STATE_SECRET=
MERCADOPAGO_ENABLED=false
PAYMENT_CRED_ENCRYPTION_KEY=
```

**Frontend**: aún NADA escrito de MP. Cuando se retome:
- Página `/organizer/companies/:id/payments` para "Conectar pasarela"
- Branch en checkout para renderizar MP brick vs Wompi widget

### ❌ Pendiente para Fase 2 cuando se retome
- `POST /api/checkout/mp-webhook` — endpoint de webhooks MP
- Refactor de `InitiateCheckoutUseCase` para usar `PaymentGatewayRegistry`
  y resolver gateway por `event.companyId.preferredGateway`
- Refresh job para tokens MP cerca de expirar (180 días, refrescar a 150)
- FE: panel "Conectar pasarela de pago"
- FE: branching en checkout

---

## Deploy de la Fase 1 (cuando estés listo)

### Paso 0 — Estado actual del repo

Todo lo de Fase 1 está **en main, pasa typecheck, no rompe nada**. La
Fase 2 también está en main pero con todos sus flags en `false`, así que
**no afecta** la operación actual.

Todos los flags de Fase 2 están OFF por defecto:
- `MERCADOPAGO_ENABLED=false`
- `WOMPI_PAYOUTS_ENABLED=false` (se prende cuando Wompi SPT esté activo)

Mientras esos flags estén false, el sistema opera **idéntico al pre-cambios**:
Wompi gateway clásico, payouts manuales, sin MP en absoluto.

### Paso 1 — Migración de schema (PROD)

Hay 6 cambios de schema nuevos que necesitan llegar a producción:

1. `payout_records.provider_name` (varchar 30, nullable)
2. `payout_records.provider_reference` (varchar 80, nullable, indexed)
3. `payout_records.failure_reason` (varchar 500, nullable)
4. `user_payout_methods.wompi_bank_id` (varchar 80, nullable)
5. `user_payout_methods.account_type` (varchar 10, nullable)
6. `companies.preferred_gateway` (varchar 30, default 'wompi')
7. `orders.application_fee_amount` (integer, nullable)
8. **Tabla nueva** `company_payment_gateway_credentials` (ver
   `src/payments/infrastructure/orm/company-payment-gateway-credential.orm.entity.ts`
   para el schema completo)

**Si tu prod usa `synchronize: true`** (igual que dev): no hay nada que
hacer, TypeORM auto-aplica al deploy. Verifica con:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'application_fee_amount';
```

**Si tu prod usa `synchronize: false`** (recomendado para prod): genera
una migración antes del deploy:
```bash
yarn migration:generate src/database/migrations/payments-fase1-fase2-foundations
yarn migration:run
```

### Paso 2 — Activar Wompi Payouts comercialmente

1. Entrar a `wompi.com/es/co/soluciones/payouts.html` → solicitar
   activación de **SPT (Servicio de Pagos a Terceros)**.
2. El representante legal firma. Aprobación en 2-5 días hábiles.
3. Wompi te entrega:
   - `WOMPI_PAYOUTS_PRIVATE_KEY` (separada del gateway key)
   - `WOMPI_PAYOUTS_ORIGIN_ACCOUNT_ID` (UUID de la cuenta Wompi origen)

### Paso 3 — Habilitar el flag en prod

Editar `.env` del VPS:
```bash
WOMPI_PAYOUTS_API_URL=https://api.wompi.co/v1
WOMPI_PAYOUTS_PRIVATE_KEY=<wompi_te_lo_da>
WOMPI_PAYOUTS_ORIGIN_ACCOUNT_ID=<wompi_te_lo_da>
WOMPI_PAYOUTS_ENABLED=true
```

Reiniciar PM2:
```bash
pm2 restart hypepass-be --update-env
```

### Paso 4 — Validación end-to-end

1. Login como organizador → ir a Settings → "Payout method".
2. Crear cuenta de payout — la pantalla debe mostrar el dropdown de bancos
   real (no el fallback de input manual).
3. Vender un ticket de prueba en un evento.
4. Esperar que el evento "termine" + 48h (o forzar `releaseAt` en DB
   para acelerar test).
5. El sweeper `disperse-payouts` corre cada hora — verás en los logs
   `Dispersing N payable payout(s) via Wompi…`.
6. El payout pasa de `PAYABLE` → `PAID` con `provider_reference` lleno.
7. Confirmar en el panel `/organizer/payouts` que aparece como pagado.
8. La plata debería caer en la cuenta bancaria del organizador en 1-3
   días hábiles (no es instantáneo, es Wompi).

### Paso 5 — Si algo falla

- **`failure_reason: "Payout method not verified yet"`**: el admin
  debe marcar el método como `verifiedAt` en DB. Hoy es manual; v2
  agregar un micropago de verificación.
- **`failure_reason: "missing Wompi bank metadata"`**: el organizador
  guardó su método con datos incompletos (sin `wompiBankId` o
  `accountType`). Pídele que actualice el método en su perfil.
- **Token rejected by Wompi**: revisar que `WOMPI_PAYOUTS_PRIVATE_KEY`
  esté bien (es distinto al gateway key).
- **5xx de Wompi**: el sweeper marca como retryable, vuelve a intentar
  en la siguiente corrida (1h después). No requiere intervención.

---

## Cuándo retomar Fase 2 (MercadoPago)

**Trigger**: cuando hayas constituido la empresa en cámara de comercio
(matrícula mercantil persona natural comerciante O SAS — cualquiera
sirve).

### Pre-requisitos antes de codear más
1. Tener NIT de empresa + RUT actualizado + cámara de comercio.
2. Cuenta MercadoPago de empresa con KYC completo.
3. App de developer creada en `mercadopago.com.co/developers/panel/app`
   marcando "Soluciones de pago para terceros".
4. Habilitación comercial de Split Payments solicitada
   (`partners@mercadopago.com`, 1-3 semanas).

### Pasos para retomar (~1-2 semanas de dev)
1. **Pegar credenciales** en `.env`:
   ```bash
   MERCADOPAGO_CLIENT_ID=
   MERCADOPAGO_CLIENT_SECRET=
   MERCADOPAGO_ACCESS_TOKEN=
   MERCADOPAGO_PUBLIC_KEY=
   MERCADOPAGO_WEBHOOK_SECRET=
   PAYMENT_CRED_ENCRYPTION_KEY=  # generar con: openssl rand -base64 32
   ```
2. **Webhook MP** — implementar `POST /api/checkout/mp-webhook`:
   - Verifica firma con `MercadoPagoService.verifyWebhookSignature`
   - Resuelve `companyId` desde el `external_reference`
   - Delega a `HandleWebhookUseCase` con context `{ companyId, gateway: 'mercadopago' }`
3. **Refactor `InitiateCheckoutUseCase`**:
   - Cambiar `@Inject(payment_gateway_token)` por `PaymentGatewayRegistry`
   - Resolver gateway con `registry.resolve(company.preferredGateway)`
   - Pasar `{ companyId, applicationFeeAmount }` en el ctx para MP
   - Calcular `applicationFeeAmount` = `grandTotal * applicationFeePct / 10000`
4. **Refresh job** para tokens MP que expiran en <30 días.
5. **FE — Panel "Conectar pasarela"** en `/organizer/companies/:id/payments`:
   - Lista status de cada gateway desde `GET /companies/:c/payments/gateways`
   - Botón "Conectar MercadoPago" → window.location a `/companies/:c/payments/mp/authorize`
   - Botón "Desconectar" → `POST /companies/:c/payments/mp/disconnect`
   - Toggle preferred_gateway entre Wompi y MP
6. **FE — Branching en checkout**:
   - El response de `initiate-checkout` ya devuelve `signature` y `publicKey`
     (que para MP es el preference_id y la public key del seller)
   - Detectar si es MP por algo así como `gateway: 'mercadopago'` en el
     response (agregar campo cuando hagamos el refactor del usecase)
   - Si MP → cargar el SDK de MP brick + render
   - Si Wompi → comportamiento actual

### Lo que NO hay que tocar al retomar
- `WompiService` — ya está alineada con el port nuevo (async + name).
- Schema de DB — ya está creado (en dev por synchronize, en prod por
  migración del Paso 1).
- `CryptoService`, `CompanyPaymentGatewayCredentialService`,
  `MercadoPagoService` skeleton, OAuth use cases — todo escrito y
  testeable contra sandbox de MP.

---

## Referencias rápidas

| Concepto | Archivo |
|---|---|
| Plan original (más detalle) | `PAYMENTS_HYBRID_PLAN.md` |
| Wompi gateway adapter | `HypePass-BE/src/payments/infrastructure/services/wompi.service.ts` |
| Wompi Payouts adapter | `HypePass-BE/src/payments/infrastructure/services/wompi-payouts.service.ts` |
| MP gateway adapter | `HypePass-BE/src/payments/infrastructure/services/mercadopago.service.ts` |
| MP OAuth service | `HypePass-BE/src/payments/application/services/mercadopago-oauth.service.ts` |
| Crypto util | `HypePass-BE/src/shared/infrastructure/services/crypto.service.ts` |
| Disperse cron | `HypePass-BE/src/sweepers/disperse-payouts.sweeper.ts` |
| Disperse use case | `HypePass-BE/src/marketplace/application/use-case/disperse-payout.usecase.ts` |
| Mis liquidaciones (FE) | `HypePass-FE/src/presentation/pages/organizer/my-payouts.tsx` |

---

## Cómo retomar en una sesión nueva

Cuando estés listo para el siguiente sprint, en una sesión nueva di literal:

> "Mira `PAYMENTS_STATUS.md` y `PAYMENTS_HYBRID_PLAN.md`. La Fase 1 ya
> está deployada en producción y funcionando. Ya tengo empresa
> constituida + cuenta MP creada. Vamos a retomar la Fase 2."

El asistente debería:
1. Leer ambos `.md`.
2. Pedirte las credenciales MP para guardarlas en `.env`.
3. Empezar por el webhook + refactor del initiate-checkout.
4. Después la pantalla "Conectar pasarela" del FE.
5. Por último el branching en checkout.

---

## Notas operativas

- **`PAYMENT_CRED_ENCRYPTION_KEY` en prod**: cuando vayas a Fase 2,
  genera una clave nueva en el VPS (no copies la de dev). La clave
  encripta tokens MP de los organizadores — si la pierdes, todos los
  organizadores tienen que reconectar MP. Guárdala en backup seguro.
- **`MERCADOPAGO_STATE_SECRET`**: si no lo seteas, `MercadoPagoOAuthService`
  usa `MERCADOPAGO_CLIENT_SECRET` como fallback. Para prod hardening,
  genera uno separado: `openssl rand -base64 32`.
- **El sweeper de payouts corre cada hora**. En prod con muchos eventos
  esto puede ser lento — si llega a haber >1000 payouts pendientes en
  una iteración, considera bajar `PAYOUT_DISPERSION_BATCH_SIZE` y subir
  la frecuencia del cron a `EVERY_30_MINUTES`.
- **Wompi y MP no compiten** después de Fase 2. Cada compañía elige uno.
  Wompi sigue siendo válido para organizadores que no quieren MP.
