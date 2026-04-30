# HypePass — Plan de pagos híbrido (Wompi + MercadoPago)

**Estado**: planificación / no se ha escrito código todavía.
**Fecha**: 2026-04-30
**Objetivo**: dejar de ser merchant of record para automatizar liquidaciones
y reducir el riesgo legal/operativo. Modelo híbrido: Wompi (actual) +
MercadoPago Split (nuevo). Cada organizador elige su gateway al
onboardearse.

---

## 1. Estado del código actual

Lo bueno: la arquitectura ya está preparada para multi-gateway.

### Lo que ya existe
- **`PaymentGatewayPort`** (`src/payments/domain/ports/payment-gateway.port.ts`)
  — clase abstracta con 5 métodos: `getPublicKey`, `generateSignature`,
  `verifyWebhookSignature`, `getTransaction`,
  `getTransactionByReference`. **Diseñado precisamente para esto.**
- **`WompiService`** implementa el port. Vive en
  `src/payments/infrastructure/services/wompi.service.ts`.
- **`PayoutMethod`** module (`src/payout-methods/`) con datos bancarios
  del organizador (banco, cuenta, holder name, legal id). **Esto cubre
  lo que necesita Wompi Payouts API.**
- `InitiateCheckoutUseCase` ya consume el port, no Wompi directamente.

### Lo que NO existe todavía
- **Liquidación automática** — hoy las transferencias a organizadores
  se hacen manuales o vía panel admin.
- **Soporte multi-gateway por compañía** — el port asume credenciales
  globales. Para MP, cada compañía tiene sus propias credenciales
  (access_token via OAuth).
- **MercadoPago adapter**.
- **`application_fee` model** — no hay un campo en `orders` o
  `companies` que diga "qué porcentaje cobra HypePass por cada venta".

---

## 2. Estrategia: Fase 1 → Fase 2

```
FASE 1 (1-2 semanas) — Wompi Payouts (Pagos a Terceros)
  ↓ Quick win operacional. Cero cambio arquitectónico.
  ↓ Resuelve el dolor inmediato: liquidación manual.
  ↓ HypePass sigue siendo merchant of record (lo aceptamos por ahora).

FASE 2 (3-4 semanas) — MercadoPago Split como gateway alternativo
  ↓ Cambio arquitectónico real: per-company gateway selection.
  ↓ Reduce el volumen que pasa por la cuenta de HypePass.
  ↓ Nuevos organizadores eligen MP al onboardearse.

FASE 3 (gradual, 6-12 meses) — Migración voluntaria de Wompi → MP
  ↓ No bloquear a nadie. Empujar por defecto a MP.
  ↓ Eventualmente Wompi queda solo como fallback.
```

---

## 3. FASE 1 — Wompi Payouts (Pagos a Terceros)

### 3.1 Pre-requisito de cuenta Wompi
1. Entrar a `wompi.com/es/co/soluciones/payouts.html`
2. Solicitar activación del producto SPT (Servicio de Pagos a Terceros).
   El representante legal debe firmar.
3. Esperar 2-5 días hábiles de revisión.
4. Cuando llegue el OK: anotar el `origin_account_id` (cuenta Wompi de
   la que se va a dispersar).
5. Pedirles los API keys del módulo Payouts (separado del payment
   gateway). Estos pueden ser distintos a los actuales.

### 3.2 Variables de entorno nuevas
Agregar al `.env` del BE:

```bash
# Wompi Payouts (Pagos a Terceros)
WOMPI_PAYOUTS_API_URL=https://api.wompi.co/v1   # mismo endpoint base
WOMPI_PAYOUTS_PRIVATE_KEY=<key SPT>             # distinto al gateway
WOMPI_PAYOUTS_ORIGIN_ACCOUNT_ID=<uuid>          # de la cuenta Wompi
WOMPI_PAYOUTS_ENABLED=false                      # feature flag para
                                                 # activar gradual
```

### 3.3 Tareas técnicas (BE)

#### 3.3.1 Service nuevo
**Archivo**: `src/payments/infrastructure/services/wompi-payouts.service.ts`

Métodos:
- `listBanks()` — `GET /banks` (cachear 24h en Redis si está disponible).
- `dispersePayment(input: { recipient: ..., amount, reference })`
  — `POST /payouts` con auth `Bearer WOMPI_PAYOUTS_PRIVATE_KEY`.
- `getPayoutStatus(payoutId)` — `GET /payouts/:id`.

Errores manejados:
- 400/422: log + return `failed` con razón
- 5xx / network: retry con backoff 3 veces
- 200: return `paid` con `payout_id` de Wompi

#### 3.3.2 Usecase nuevo: `DispersePayoutUseCase`
**Archivo**: `src/marketplace/application/use-case/disperse-payout.usecase.ts`

Toma un `payoutRecord` con `status = payable`, lookup el
`PayoutMethod` default del usuario, llama a
`WompiPayoutsService.dispersePayment`, actualiza el record a
`paid` o `failed` con `provider_reference`.

Audit log: `payout.dispersed` (acción nueva en `audit-log-action.ts`).

#### 3.3.3 Cron job
**Archivo**: `src/sweepers/disperse-payouts.sweeper.ts`

- Cada hora.
- Busca `payout_records` con:
  - `status = payable`
  - `eventEndsAt + 48h <= now`
  - El usuario tiene un `PayoutMethod` default y `verifiedAt != null`
- Procesa máximo 50 por iteración (rate limit de Wompi).
- Llama `DispersePayoutUseCase` por cada uno.

Feature flag: `WOMPI_PAYOUTS_ENABLED=true` para activarlo. Mientras
esté en `false`, el cron es no-op — útil para deployar el código
antes de que Wompi active el producto.

#### 3.3.4 Verificación bancaria del organizador
Antes de dispersar, validar que `PayoutMethod` esté completo y
`verifiedAt != null`. Hoy `verifiedAt` se setea manualmente desde
admin. Para MVP basta con esto.

V2 opcional: micropago de verificación ($1.000 COP a la cuenta para
confirmar que existe — es lo que hace Mercado Pago al onboardear).

### 3.4 Tareas técnicas (FE)

#### 3.4.1 Pantalla onboarding "Datos bancarios"
**Archivo**: `src/presentation/pages/organizer/payout-method.tsx`
(probablemente ya existe — revisarlo).

Campos requeridos según Wompi Payouts API:
- Tipo legal ID (CC/CE/NIT/PP/TI)
- Número de documento
- Banco (dropdown poblado con `GET /banks` de Wompi → BE proxy)
- Tipo de cuenta (Ahorros/Corriente)
- Número de cuenta
- Nombre del titular (debe matchear con el legal ID)
- Email del beneficiario

Validación: si está incompleto, en `/organizer` mostrar banner ámbar
"Configura tus datos bancarios para recibir pagos automáticos de
tus eventos →".

#### 3.4.2 Pantalla "Mis liquidaciones" del organizador
**Archivo**: `src/presentation/pages/organizer/payouts.tsx` (nuevo)

Lista de `payout_records` del organizador:
- Evento
- Fecha del evento
- Status (payable / paid / failed)
- Monto neto
- Fecha de dispersión
- Referencia bancaria

### 3.5 Estado al cierre de Fase 1
- ✅ Liquidaciones automatizadas T+48h post-evento.
- ✅ Cero trabajo manual de transferencias.
- ✅ Audit trail completo.
- ⚠️ HypePass sigue siendo merchant of record (no se resuelve hasta
  Fase 2).

---

## 4. FASE 2 — MercadoPago Split como gateway alternativo

### 4.1 Pre-requisitos de cuenta HypePass en MercadoPago

#### 4.1.1 Crear cuenta MP de HypePass (marketplace)
1. Ir a `mercadopago.com.co` y crear cuenta empresa con el NIT de
   HypePass.
2. Completar perfil + KYC (subir RUT, cámara de comercio, cédula del
   representante legal).
3. Activar el modo **"Vendedor profesional"** (necesario para split).

#### 4.1.2 Crear aplicación de marketplace
1. Entrar a `mercadopago.com.co/developers/panel/app`.
2. **Crear aplicación**.
3. Marcar "**Soluciones de pago para terceros**" (esto habilita el
   modelo marketplace con `application_fee`).
4. Al final, MP da:
   - `Client ID` (público)
   - `Client Secret` (privado)
   - URLs de OAuth (auth_url, token_url)
   - Sandbox keys + Production keys

#### 4.1.3 Solicitar habilitación de Split Payments
- Para Colombia, en MVP MP **requiere aprobación comercial** del producto
  Split Payments. No se activa solo desde el panel.
- Contactar a partners@mercadopago.com con el caso de uso (marketplace
  de tickets).
- Tiempo estimado: 1-3 semanas.

### 4.2 Variables de entorno nuevas
Agregar al `.env` del BE:

```bash
# MercadoPago marketplace
MERCADOPAGO_CLIENT_ID=<de la app creada>
MERCADOPAGO_CLIENT_SECRET=<idem>
MERCADOPAGO_ACCESS_TOKEN=<token de HypePass como app>
MERCADOPAGO_PUBLIC_KEY=<public key de HypePass>
MERCADOPAGO_REDIRECT_URI=https://api.hypepass.co/api/payments/mercadopago/oauth/callback
MERCADOPAGO_WEBHOOK_SECRET=<secret para verificar webhooks>
MERCADOPAGO_API_URL=https://api.mercadopago.com
MERCADOPAGO_ENABLED=false                  # feature flag
```

Y el FE necesita el `MERCADOPAGO_PUBLIC_KEY` para el SDK del checkout
en navegador (vía `app-config.ts`).

### 4.3 Cambios en modelo de datos

#### 4.3.1 Nueva tabla `company_payment_gateway_credentials`
```sql
CREATE TABLE company_payment_gateway_credentials (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    gateway VARCHAR(20) NOT NULL,            -- 'wompi' | 'mercadopago'
    is_active BOOLEAN DEFAULT TRUE,
    -- MP specific
    mp_user_id VARCHAR(50),                  -- MP user_id of the seller
    mp_access_token TEXT,                    -- encrypted
    mp_refresh_token TEXT,                   -- encrypted
    mp_token_expires_at TIMESTAMPTZ,
    mp_public_key VARCHAR(100),
    mp_scopes VARCHAR(200),
    -- General
    application_fee_pct NUMERIC(5,2) NOT NULL DEFAULT 8,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (company_id, gateway)
);
```

Encriptar `mp_access_token` y `mp_refresh_token` con AES-256-GCM
usando una clave en `.env` (`PAYMENT_CRED_ENCRYPTION_KEY`).

#### 4.3.2 Cambio en `companies`
```sql
ALTER TABLE companies
ADD COLUMN preferred_gateway VARCHAR(20) DEFAULT 'wompi';
```

Valores: `'wompi'` | `'mercadopago'`. Default `'wompi'` para no
romper nada existente.

#### 4.3.3 Cambio en `orders`
```sql
ALTER TABLE orders
ADD COLUMN gateway VARCHAR(20) DEFAULT 'wompi',
ADD COLUMN application_fee_amount BIGINT;
```

`gateway` registra cuál proveedor procesó esta orden específica.
`application_fee_amount` para auditar exactamente qué comisión cobró
HypePass (en cents, mismo formato que `grand_total`).

### 4.4 Cambios en `PaymentGatewayPort`

El port actual asume credenciales globales. Hay que generalizarlo
para que el adapter pueda recibir credenciales per-company:

```ts
export type GatewayContext = {
    companyId?: string;            // null/undefined = use platform creds
    applicationFeeAmount?: number; // cents
};

export abstract class PaymentGatewayPort {
    /** Identifier of this gateway, e.g. 'wompi' | 'mercadopago' */
    abstract readonly name: string;

    abstract getPublicKey(ctx?: GatewayContext): Promise<string>;
    abstract generateSignature(...): Promise<...>;
    abstract verifyWebhookSignature(payload: any): Promise<boolean>;
    abstract getTransaction(...): Promise<any>;
    abstract getTransactionByReference(...): Promise<any>;
}
```

Adapter para Wompi: ignora `ctx.applicationFeeAmount` (Wompi no
soporta split, todo entra a HypePass). Adapter para MP: requiere
`companyId` para resolver credenciales y aplica `applicationFeeAmount`.

### 4.5 Resolver el gateway por orden

Nuevo service `PaymentGatewayRegistry`:
```ts
@Injectable()
class PaymentGatewayRegistry {
  resolve(companyId: string): PaymentGatewayPort {
    // lookup company.preferred_gateway → return matching adapter
  }
}
```

`InitiateCheckoutUseCase` deja de tomar `PaymentGatewayPort`
directamente y toma el registry. Resuelve el gateway por
`event.companyId`.

### 4.6 OAuth flow MP

#### 4.6.1 Endpoints nuevos
- `GET /api/payments/mercadopago/oauth/authorize?companyId=:id`
  — redirige al organizador a MP authorize URL con state firmado.
- `GET /api/payments/mercadopago/oauth/callback?code=:c&state=:s`
  — recibe el code, intercambia por access_token, guarda en
  `company_payment_gateway_credentials`, redirige a
  `/organizer/companies/:id/payments?connected=true`.
- `POST /api/payments/mercadopago/oauth/disconnect` —
  desconecta (marca `is_active = false`).

#### 4.6.2 Refresh job
Cron diario que refresca tokens próximos a expirar (180 días, refresh
~150 días).

### 4.7 MercadoPagoService (adapter)
**Archivo**: `src/payments/infrastructure/services/mercadopago.service.ts`

Implementa `PaymentGatewayPort`. Métodos clave:
- `generateSignature(...)` → MP no usa firmas como Wompi. Crea una
  preference (`POST /checkout/preferences`) con el access_token del
  seller + `application_fee` y devuelve el `preference_id`. Adaptar
  el response del checkout para incluir esto.
- `verifyWebhookSignature(payload)` → MP envía un header
  `x-signature` HMAC. Validar.
- Webhooks de MP llegan a un endpoint nuevo `/api/checkout/mp-webhook`.

### 4.8 Cambios en FE

#### 4.8.1 Pantalla "Conectar pasarela de pago"
**Archivo**: `src/presentation/pages/organizer/company-payments.tsx`

UI por compañía:
```
[Wompi]  ⚪ Activo (default)
         "Pagos van a la cuenta de HypePass y nosotros liquidamos a tu banco T+48h."

[MercadoPago] ⚪ No conectado
         "Pagos van directamente a tu cuenta MercadoPago. HypePass solo cobra comisión."
         [Conectar mi MercadoPago →]
```

#### 4.8.2 Cambio en checkout (cliente)
El widget de Wompi y el de MP son diferentes. El FE necesita renderizar
uno u otro según el gateway que viene en `InitiateCheckoutResponse`.

Agregar al response un campo `gateway: 'wompi' | 'mercadopago'` y un
campo `mpPreferenceId?` cuando aplica.

### 4.9 Estado al cierre de Fase 2
- ✅ Organizadores pueden elegir MP en onboarding.
- ✅ Compradores pagan, plata va directo a la cuenta MP del organizador.
- ✅ HypePass solo recibe `application_fee` en su cuenta MP.
- ✅ Wompi sigue funcionando para los que no migran.

---

## 5. FASE 3 — Migración gradual (no codeable hoy)

- Comunicación a organizadores existentes con beneficios de MP.
- Botón "Migrar a MP" en el panel.
- Reportes consolidados que muestren ventas de ambos gateways.
- Eventualmente: hacer MP el default en nuevos onboardings.

---

## 6. Cómo registrarte en MercadoPago — paso a paso

### 6.1 Cuenta empresa
1. Ir a `mercadopago.com.co` → "Crear cuenta" → "Empresa".
2. Datos: NIT de la empresa, nombre legal, contacto, email.
3. Confirmar email.
4. Login → completar perfil.

### 6.2 KYC
- Subir cédula del representante legal (frente y atrás).
- Subir RUT actualizado.
- Subir cámara de comercio (no más de 30 días).
- Confirmar cuenta bancaria de retiros (donde MP transfiere los
  saldos cuando ustedes quieran retirar).
- Tiempo de aprobación: 1-3 días hábiles.

### 6.3 Crear aplicación dev
1. `mercadopago.com.co/developers/panel/app` → "Crear aplicación".
2. Nombre: "HypePass Marketplace".
3. URL de redirección: `https://api.hypepass.co/api/payments/mercadopago/oauth/callback`
   (también agregar `http://localhost:3000/...` para dev).
4. Modelo: marcar **"Soluciones de pago para terceros"** (clave para
   habilitar el split).
5. Guardar. Tendrán:
   - `Client ID`
   - `Client Secret`
   - `Public Key` (sandbox + production)
   - `Access Token` (sandbox + production)

### 6.4 Habilitar Split Payments comercialmente
- Entrar a `mercadopago.com.co/developers/es/docs/split-payments/landing`
  para ver el flujo.
- Para producción, escribir a `partners@mercadopago.com` (o usar el
  formulario "Hablar con ventas") describiendo:
  - Caso de uso: marketplace de ticketing
  - Volumen estimado mensual
  - Modelo: cada organizador tiene su cuenta, HypePass cobra
    `application_fee` por cada venta
- Tiempo: 1-3 semanas.

### 6.5 Configurar webhooks
1. En la app creada → "Webhooks" → URL:
   `https://api.hypepass.co/api/checkout/mp-webhook`
2. Eventos a suscribir: `payment` (created, updated, refunded).
3. Copiar el `webhook secret` para `MERCADOPAGO_WEBHOOK_SECRET`.

---

## 7. Resumen de variables de entorno (final state)

```bash
# === FASE 1 — Wompi Payouts (agregar ahora) ===
WOMPI_PAYOUTS_API_URL=https://api.wompi.co/v1
WOMPI_PAYOUTS_PRIVATE_KEY=
WOMPI_PAYOUTS_ORIGIN_ACCOUNT_ID=
WOMPI_PAYOUTS_ENABLED=false

# === FASE 2 — MercadoPago (agregar después) ===
MERCADOPAGO_CLIENT_ID=
MERCADOPAGO_CLIENT_SECRET=
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_REDIRECT_URI=https://api.hypepass.co/api/payments/mercadopago/oauth/callback
MERCADOPAGO_WEBHOOK_SECRET=
MERCADOPAGO_API_URL=https://api.mercadopago.com
MERCADOPAGO_ENABLED=false

# Encriptación de tokens guardados (Fase 2)
PAYMENT_CRED_ENCRYPTION_KEY=  # 32 bytes base64
```

Generar `PAYMENT_CRED_ENCRYPTION_KEY` en local con:
```bash
openssl rand -base64 32
```

---

## 8. Decisiones de arquitectura tomadas

1. **Wompi y MP coexisten** — no hay big-bang migration. Cada compañía
   tiene un `preferred_gateway`.
2. **Encriptamos los access tokens de MP en DB** — AES-256-GCM con
   clave en env. Nunca en logs.
3. **`application_fee_pct` por compañía** — permite negociar comisiones
   especiales con organizadores grandes sin tocar código.
4. **Feature flags para activación gradual** — `WOMPI_PAYOUTS_ENABLED`
   y `MERCADOPAGO_ENABLED` para deployar código antes de tener cuenta
   activa.
5. **Audit log para todo** — `payout.dispersed`, `payment.gateway_connected`,
   `payment.gateway_disconnected`. Trazabilidad completa.
6. **No tocamos el `PaymentGatewayPort`** en Fase 1 — solo agregamos
   payouts. La generalización a multi-gateway pasa en Fase 2.

---

## 9. Estimación de esfuerzo

| Fase | Tareas | Tiempo full-time |
|---|---|---|
| Fase 1 (Wompi Payouts) | Service + cron + UI organizer | 6-10 días |
| Fase 2 (MP Split) | OAuth + adapter + DB + UI + webhooks | 15-20 días |
| Fase 3 (migración) | Comunicación + reportes consolidados | gradual |

**Total Fases 1+2: ~3-4 semanas.**

---

## 10. Próximos pasos

1. ⏳ **Inicia activación de Wompi Payouts** (2-5 días hábiles): contactar
   a Wompi por el SPT y conseguir las credenciales.
2. ⏳ **Crea la cuenta MP de HypePass** y la aplicación de marketplace
   (~1 día + 1-3 días de KYC).
3. ⏳ **Solicita la habilitación comercial de MP Split Payments**
   (1-3 semanas).
4. ✅ **Confirmar plan** y empezar Fase 1 mientras se completa #1-3.
