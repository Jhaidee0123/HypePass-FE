# HypePass — Instagram Content Plan

Guía maestra para generar posts de IG. Este documento existe para que cualquier
sesión nueva (con Claude / GPT / quien sea) pueda continuar la línea editorial
sin reinventar la rueda.

Última actualización: 2026-04-27.

---

## 1. Brand specs reutilizables

> **Pegar este bloque al inicio de cada prompt para generador de imágenes.**

```
BRAND: HypePass — Colombian ticketing platform for live events.

VISUAL SYSTEM (Pulse design language):
- Primary background: deep matte black #0a0908 (warm-leaning, not pure #000)
- Hero accent: electric lime #d7ff3a (highlights, glow, key text)
- Secondary accent: magenta hot pink #ff2e93 (sparingly, for HOT/LIVE/RULE markers)
- Functional: success #5eeac7, warn #ffb454
- Mid greys: #1a1917 (panels), #34312c (borders), #908b83 (muted text), #faf7f0 (text on dark)

TYPOGRAPHY:
- Display headlines: tall, condensed, all-caps sans-serif similar to Bebas Neue
  — wide letter spacing, stark
- Body: clean geometric grotesque similar to Space Grotesk
- Labels / mono: monospace similar to JetBrains Mono — uppercase, generous
  letter-spacing 0.12em

AESTHETIC: editorial, high-contrast, cinematic, slight grain texture overlay,
subtle scan-lines, glowing lime aurora as ambient light source. Think:
Berghain meets Tron meets a vinyl release poster. NOT corporate, NOT playful,
NOT pastel.

FORMAT: 1:1 square, 1080×1080px, Instagram feed.
```

---

## 2. Voz editorial

| Sí | No |
|---|---|
| Uncompromising, directo, "manifiesto" | Suave, marketing-speak, "descubre las increíbles…" |
| Español primary, EN secundario | Spanglish | mezcla forzada |
| Editorial / streetwear / poster | Corporate / clipart / stock photos |
| Frases cortas, mucho aire | Párrafos largos en captions |
| Emojis específicos y escasos (🎟️ 🛡️ 🔁 🔗 ↗) | Sobrecarga de emojis |
| Llamar a las cosas por su nombre ("estafa", "screenshot", "techo") | Eufemismos suaves |
| Tono de "ya era hora de esto" | Tono de "somos otra plataforma más" |

**Tagline canónica**: "Live events. Real access." (también versión ES: "Tickets reales. Reventa justa.")

**Reglas de contenido específicas**:
- **No mencionar porcentajes de reventa** (ej: 1.2×, 1.3×, 20% extra). El multiplicador del techo es configurable por evento — el organizador lo define. Siempre hablar de "precio máximo definido por el organizador" o "ninguno permite abuso", nunca un número fijo. El default técnico existe en el código pero no es contenido de marca.
- **No prometer features que no existen todavía**. Si dudas, revisa `CLAUDE.md` del repo o los use cases en `src/`.
- **No mencionar competidores por nombre** en posts públicos.

---

## 3. Estrategia: fases del contenido

```
FASE 1 — LAUNCH (posts 1-3)
   Objetivo: presentación + ganchear curiosidad + explicar promesa
   Estado: prompts redactados ✓

FASE 2 — TRUST (posts 4-6)
   Objetivo: pivote a organizadores + educación técnica + postura de marca
   Estado: prompts redactados ✓

FASE 3 — ACTIVATION (posts 7-9)  [PENDIENTE]
   Objetivo: primer evento real + amplitud de categorías + social proof

FASE 4 — RECURRING (posts 10+)   [PENDIENTE]
   Objetivo: drops semanales + features deep-dives + testimoniales
```

Mezcla de tipos por mes (rule of thumb):
- 40% producto / drops de eventos
- 25% educación / cómo funciona
- 20% marca / manifiesto / values
- 15% comunidad / behind-the-scenes / testimoniales

---

## 4. Reglas de color en el grid

Para que el feed se vea intencional y no monótono:

| Tipo de post | Color dominante | Ejemplo |
|---|---|---|
| Reveal de marca / hype | Lime (`#d7ff3a`) sobre negro | Posts 1, 3, 5 |
| Producto / educación | Lime sobre negro | Posts 5, 9 |
| Behind-the-scenes / B2B / dashboard | Lime + amber (`#ffb454`) sobre negro | Post 4 |
| Manifiesto / regla / postura | **Magenta (`#ff2e93`) sobre negro**, lime mínimo | Post 6 |
| Drop de evento real (hot) | Magenta + lime, máxima saturación | Pendiente |

Pattern del grid de 9 posts (3×3 rows): alternar bloques lime con un magenta cada 4-5 posts y un amber/B2B cada 5-6 para romper visualmente.

---

## 5. Posts ya redactados

### POST 1 — "El reveal" ✓
- **Fase**: Launch
- **Color**: Lime sobre negro
- **Concepto**: Poster de presentación. Brand mark glow + tagline. Sin explicar nada todavía.
- **Caption hook**: "Algo se está moviendo en Colombia. Tickets reales. Reventa justa. Acceso de verdad. Pronto. — HypePass."
- **Visual**: ticket-mark silhouette glowing lime, aurora radial, grain.

### POST 2 — "Tu ticket no es un screenshot" ✓
- **Fase**: Launch
- **Color**: Lime + magenta sobre negro (split antes/ahora)
- **Concepto**: Confrontación directa con el dolor del WhatsApp/PDF.
- **Caption hook**: "¿Tu último ticket llegó por WhatsApp? Eso ya no."
- **Visual**: split poster ANTES vs AHORA, magenta X grande sobre el lado viejo.

### POST 3 — "Lo que te garantizamos" (3 promesas) ✓
- **Fase**: Launch
- **Color**: Lime sobre negro
- **Concepto**: 3 pilares: primario verificado / reventa con techo / QR anti-fraude.
- **Caption hook**: "3 promesas que no rompemos."
- **Visual**: phone con QR + 3 cards horizontales con label mono + headline display.

### POST 4 — "Detrás de toda noche" (organizadores) ✓
- **Fase**: Trust
- **Color**: Lime + amber sobre negro
- **Concepto**: Pivot a la audiencia B2B (productores, promotores, bookers).
- **Caption hook**: "¿Tu próximo evento existe en tu cabeza? Saquémoslo."
- **Visual**: silhueta low-angle backstage + dashboard panel flotante con métricas.

### POST 5 — "El QR que no se clona" ✓
- **Fase**: Trust
- **Color**: Lime sobre negro
- **Concepto**: Educativo. Por qué los tickets no se pueden falsificar (3 razones técnicas en idioma humano).
- **Caption hook**: "¿Y si me llega un QR falso? No es posible. Aquí el por qué."
- **Visual**: phone con QR central + 3 badges numerados con annotation lines.
- **Nota**: gran candidato para reel animado.

### POST 6 — "Reventa, sí. Especulación, no." (anti-scalping) ✓
- **Fase**: Trust
- **Color**: **Magenta dominante** sobre negro (rompe patrón del feed)
- **Concepto**: Manifiesto contra la reventa especulativa. Postura pública.
- **Caption hook**: "Reventa, sí. Especulación, no."
- **Visual**: dos líneas display gigantes "REVENTA, SÍ." / "ESPECULACIÓN, NO." con strikethrough magenta sobre el "NO". Aurora magenta de fondo. Impacto puramente tipográfico.
- **Reglas de contenido**: **NUNCA mencionar el porcentaje específico del techo** (1.2×, 1.3×, etc.). El multiplicador varía por evento — el organizador lo configura. Hablar siempre de "precio máximo definido por el organizador" o "ningún evento permite abuso", nunca de un número fijo.
- **Nota**: lanzar viernes para máximo engagement de shares.

### POST 7 — "Tus promotores son tus mejores vendedores" (organizer feature) ✓
- **Fase**: Trust → Activation (B2B)
- **Color**: Lime + amber sobre negro (línea organizer)
- **Concepto**: Feature spotlight del sistema de promotores con código + atribución automática. Apunta a productores que sufren la atribución manual con Excel.
- **Caption hook**: "¿Cuántas vendió cada promotor? Cero excels."
- **Visual**: dashboard estilizado tipo leaderboard arriba con 3 rows de promotores y barras de progreso lime/amber, debajo headline display "TUS PROMOTORES. TUS MEJORES VENDEDORES."
- **Nota**: lanzar lunes — abre semana con feature de producto.

### POST 8 — "Vende. Paga solo si vendes." (PAID AD — cold audience) ✓
- **Fase**: Activation (cold conversion)
- **Color**: Lime sobre negro, alta saturación (sin magenta — diferenciar del manifesto)
- **Concepto**: Ad pagado de conversión para audiencia fría B2B. Hook directo + value prop + CTA. Pensado para Meta Ads.
- **Caption hook**: "Vende. Paga SOLO si vendes."
- **Visual**: typografía masiva centrada con "SOLO" en lime, abajo 3 value props con check marks success cyan, CTA bar lime "CREA TU EVENTO →"
- **Reglas de contenido**: este post NO usa el tono editorial. Conversion-first. Hook debe leerse en 3s. CTA explícita.
- **Variantes**: 1:1 para feed + 9:16 para Reels/Stories (el prompt incluye instrucciones de adaptación).
- **Nota**: presupuesto inicial $5-10 USD/día × 3-5 días. Métricas: CTR ≥1.5%. Lookalike audience cuando lleguen a 1K seguidores.

### POST 9 — "Tu evento, sea cual sea" (broaden perception) ✓
- **Fase**: Activation
- **Color**: **Excepción** — usa los 4 acentos Pulse simultáneamente (lime + magenta + amber + success cyan). El mensaje es la diversidad.
- **Concepto**: rompe la percepción de "HypePass = conciertos". Muestra 6 verticales (festivales, fiestas, deportes, teatro, conferencias, MMA).
- **Caption hook**: "No solo conciertos."
- **Visual**: bento grid de 6 cards 3×2, cada una con su ícono outline + label en un acento distinto. Headline display abajo "TU EVENTO, SEA CUAL SEA."
- **Nota**: viernes — genera shares de productores de nichos no-musicales que sienten que "esto también es para mí". Después de este post el grid tendrá colores fuertes seguidos (6 + 9), así que **posts 10-12 deben volver a lime+black puro** para descongestionar visualmente.

---

## 6. Backlog de ideas (no redactadas todavía)

Cuando el usuario pida más posts, considerar primero estos:

### Fase 3 — Activation
- **"Primer evento en venta"** — el día que se publica el primer evento real. Anuncio celebratorio. Magenta + lime, foto del cover del evento.
- ~~**"No solo conciertos"**~~ → entregado como Post 9 ✓
- ~~**"Tu primer evento, gratis publicarlo"**~~ → entregado como Post 8 (paid ad) ✓

### Fase 4 — Recurring
- **"Cómo funciona la transferencia en 10 segundos"** — feature spotlight. Animation-friendly, ideal reel.
- ~~**"Promotores con código"**~~ → entregado como Post 7 ✓
- **"Cortesías ilimitadas por email"** — feature útil para organizadores con prensa/artistas.
- **"Pago en escrow: tu plata segura hasta el show"** — explicar el escrow del marketplace.
- **Testimonio organizador real** — cuando exista. Quote pull + foto B&W de evento real.
- **Testimonio asistente real** — captura de Twitter/IG hablando bien.
- **"Behind the scenes: construyendo HypePass"** — fundador / equipo. Autenticidad. Foto granulada B&W con texto editorial.
- **"FAQ por carrusel"** — 5-6 slides respondiendo dudas frecuentes (tarjetas ¿reembolso? ¿transferencia internacional? etc.).
- **"Estadística sorpresa"** — ej: "el 73% de los tickets falsos en LATAM se mueven por WhatsApp". Stat poster grande.

### Reels / video
- Animación del QR rotando cada 30s mientras un timer baja → reveal
- Time-lapse de un organizador creando su evento en el dashboard
- Test del lector escaneando + sonido de scan + ✓ verde

---

## 7. Estructura del prompt para imágenes

Patrón que funciona consistentemente:

```
[brand specs]

[opcional] COLOR VARIATION FOR THIS POST: ...

COMPOSITION:
- Layout (1:1, split, centered, etc.)
- Sujeto principal (qué pasa en el centro)
- Sujetos secundarios (badges, annotations)
- Background tratamientos (aurora, grain, scan-lines)

TEXT ON IMAGE:
- Top corner / center / bottom — qué dice exactamente
- Typeface intent (display condensed all-caps / mono small uppercase / etc.)
- Color of each text block

MOOD: una frase. Ej: "editorial, mysterious, anticipation".

NEGATIVE: lista corta de qué evitar (clipart, faces, pastels, emojis).
```

**Verdad práctica**: ningún generador de IA renderiza fuentes específicas
con precisión. Para producción seria, **generar el background/composición
con IA y armar el texto en Figma/Canva** sobre frame 1080×1080 con las
fuentes reales (Bebas Neue, Space Grotesk, JetBrains Mono).

---

## 8. Cadencia recomendada

```
Lunes      — Launch / Manifiesto (alto impacto, abre semana)
Miércoles  — Producto / Educación (mid-week, retention)
Viernes    — Drops / Anti-scalping / Postura (genera shares)

Domingo    — Reels behind-the-scenes / cuenta historias (algoritmo premia)
```

Espaciar 48-72h entre posts para que el primero "respire" antes del siguiente.

---

## 9. Cómo usar este doc en sesiones futuras

Cuando pidas posts nuevos, di algo como:

> "Mira `INSTAGRAM_CONTENT_PLAN.md` y dame los próximos 3 posts. Estamos en
> [Fase 2 / Fase 3 / lo que sea]. Quiero que mantengas las reglas de color
> y propongas algo del backlog o nuevo."

El asistente debería:
1. Leer este archivo primero.
2. Confirmar la fase y el color que toca para no romper el grid.
3. Proponer 3 conceptos antes de escribir prompts (alineación rápida).
4. Escribir los prompts en el formato sección 7.
5. Actualizar la sección 5 con los nuevos posts y mover idea del backlog.
