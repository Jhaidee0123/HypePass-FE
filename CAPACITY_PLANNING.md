# HypePass — Capacity Planning & Scaling Guide

Notas para tener a mano cuando crezca el tráfico o se acerque un evento masivo.
Última actualización: 2026-04-26.

## Setup actual

- **VPS**: Hostinger KVM1 (1 vCPU, 4 GB RAM, 50 GB NVMe, 4 TB bandwidth).
- **Stack**: NestJS (Node) + Postgres en la misma máquina + Resend (externo) + Wompi (externo).
- **FE**: build estático servido desde el mismo VPS.

## Lo que aguanta KVM1 hoy

| Escenario | Capacidad realista |
|---|---|
| Navegación pública (`/`, `/events`, `/marketplace`) | 1.500–3.000 concurrentes con cache. ~200–400 sin cache. |
| Wallet + acciones autenticadas (login, ver ticket, QR) | 300–500 concurrentes. |
| Checkout flujo normal (compras esporádicas) | 10–30 transacciones simultáneas. |
| Drop / venta masiva (5K–50K refrescando al mismo tiempo) | **No aguanta.** Node satura, conexiones a Postgres se agotan, Wompi empieza a 5xx. |

**Cuello de botella real** (no es el bandwidth):
1. Postgres en el mismo box compitiendo con Node por RAM.
2. Locks de inventario (`SELECT FOR UPDATE` sobre `ticket_sections` / `inventory_holds`) que son intrínsecamente seriales por sección.
3. Wompi: cada `initiate-checkout` espera la firma del widget. Latencia variable.

Para eventos de 1.000–2.000 tickets vendidos en horas, KVM1 está bien.
Para drops tipo "10K en 5 minutos", no.

---

## Roadmap por niveles

### Nivel 0 — Sin pagar más
- **FE estático en Cloudflare Pages / Vercel**. El VPS deja de servir HTML/JS/CSS, solo expone la API. Libera ~30% CPU + 80% bandwidth. Gratis.
- **`Cache-Control` agresivo** en endpoints públicos (`GET /public/events`, `/public/events/:slug`). 60s de TTL borran la presión en eventos en tendencia.
- **Cloudflare delante del API** (proxy naranja). Cachea GETs públicos en el edge + protección anti-bots.
- **`pg_stat_statements`** activo + revisar queries lentas. Suele aparecer 1–2 N+1 que matan todo.

### Nivel 1 — Próximos miles de usuarios (KVM2 + Postgres separado)
- **Subir a KVM2** (2 vCPU, 8 GB). Duplica capacidad por +1.000 COP/mes.
- **Postgres a managed**: Neon (free tier generoso), Supabase, DigitalOcean Managed DB ($15/mes). Beneficios:
  - Connection pooling (PgBouncer) sin configurar.
  - Backups automáticos.
  - Libera 1.5–2 GB RAM en el VPS para Node.
- **Redis en el VPS** (~50 MB RAM): cachear `event-detail`, `sales-summary`, `dashboard` con TTLs cortos.

### Nivel 2 — Drops medianos (5K–10K simultáneos)
Requiere **cambiar el flujo de checkout**, no solo escalar:

- **Sala de espera virtual** para la ventana del drop:
  - **Cloudflare Waiting Room** (~$25/mes/dominio). Recomendado, integración trivial.
  - **Queue-it** (estándar industrial, caro).
  - **DIY**: servicio que entrega tokens secuenciales; solo N tokens activos pueden llegar a `/checkout/initiate`. Resto ve una página "vas en el puesto 3.412" con polling cada 5s.
- **Pre-warming de inventario**: antes del drop, precalcular contadores de `ticket_sections` en Redis. Hold inicial contra Redis (rápido, atómico) y luego confirmar a Postgres.
- **Worker queue para `initiate-checkout`**: en vez de lockear inline en HTTP, encolar intent en BullMQ/Redis y un worker lo procesa. FE hace poll a `/checkout/status/:intentId`. Esto absorbe spikes sin caer.
- **Auto-scaling horizontal**: 2–3 instancias de Node detrás de un load balancer. Hostinger KVM no soporta esto bien — aquí migras a **DigitalOcean App Platform / AWS / Fly.io**. KVM4 aguanta más pero solo escala vertical.

### Nivel 3 — Evento masivo (50K+)
Hostinger ya no sirve. Necesitas:
- App en Kubernetes / ECS / Fly con autoscale.
- Postgres + read replicas.
- Redis cluster.
- CDN + Waiting Room obligatorio.
- **Idempotency keys robustas en Wompi** (retries no duplican órdenes).
- Pruebas de carga con k6 / Artillery simulando el drop.

Costo: $300–1.500 USD/mes solo de infra durante el mes del evento.

---

## Acciones prioritarias (cuando llegue el momento)

En orden de ROI:

1. **Mover FE a Cloudflare Pages** (~1 tarde). Mayor beneficio inmediato.
2. **Postgres a Neon free tier** (~1 tarde). Saca la BD del VPS.
3. **Redis local + cache de endpoints públicos** (~1 día).
4. **Pruebas de carga con k6** en staging — simular 1K usuarios refrescando `/events/:slug` y ver dónde rompe. Sin esto vas a ciegas.

Cuando tengas un evento real de >2.000 tickets vendidos rápido: enciendes Cloudflare Waiting Room y cubres el 95% de los casos.
El Nivel 3 solo si vendes "10K tickets en 60 segundos".
