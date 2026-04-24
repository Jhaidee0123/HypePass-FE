#!/usr/bin/env python3
"""
Generate a printable PDF of all the smoke-test flows for HypePass.

Pulls the brand logo + glyph from public/, builds a layout with the Pulse
palette (ink black / lime / magenta), and dumps the result to
`docs/HypePass — Manual de Pruebas.pdf`.

Run:
    python3 scripts/generate-test-pdf.py
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable, Tuple

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.flowables import HRFlowable

# ---------------------------------------------------------------------------
# Brand
# ---------------------------------------------------------------------------

INK_000 = HexColor("#0a0908")
INK_100 = HexColor("#121110")
INK_200 = HexColor("#1a1917")
INK_300 = HexColor("#242320")
INK_500 = HexColor("#5d5953")
INK_700 = HexColor("#908b83")
INK_800 = HexColor("#bfbab1")
INK_900 = HexColor("#ece8e0")
INK_1000 = HexColor("#faf7f0")
LIME = HexColor("#d7ff3a")
MAGENTA = HexColor("#ff2e93")
WARN = HexColor("#ffb454")
SUCCESS = HexColor("#5eeac7")

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
OUT_DIR = ROOT / "docs"
OUT_PDF = OUT_DIR / "HypePass — Manual de Pruebas.pdf"

# ---------------------------------------------------------------------------
# Page templates with custom canvas painting (ink-black background + footer)
# ---------------------------------------------------------------------------

PAGE_W, PAGE_H = letter
MARGIN = 0.7 * inch


def _paint_chrome(canvas, doc, *, with_logo: bool = True) -> None:
    """Black background + thin lime line at the top + footer with page n°."""
    canvas.saveState()
    # Background
    canvas.setFillColor(INK_000)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    # Top accent line
    canvas.setStrokeColor(LIME)
    canvas.setLineWidth(2)
    canvas.line(MARGIN, PAGE_H - 0.45 * inch, PAGE_W - MARGIN, PAGE_H - 0.45 * inch)
    # Tiny mono header (left)
    if with_logo:
        canvas.setFillColor(INK_700)
        canvas.setFont("Courier-Bold", 8)
        canvas.drawString(MARGIN, PAGE_H - 0.30 * inch, "◆  HYPEPASS  ·  MANUAL DE PRUEBAS")
    # Footer page number
    canvas.setFillColor(INK_500)
    canvas.setFont("Courier", 8)
    canvas.drawRightString(
        PAGE_W - MARGIN,
        0.45 * inch,
        f"PÁG. {doc.page:02d}",
    )
    canvas.setFillColor(INK_500)
    canvas.setFont("Courier", 8)
    canvas.drawString(MARGIN, 0.45 * inch, "LIVE EVENTS · REAL ACCESS")
    canvas.restoreState()


def _paint_cover(canvas, doc) -> None:
    """Cover page: solid black + brand wash + glyph."""
    canvas.saveState()
    canvas.setFillColor(INK_000)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    # Decorative magenta glow upper-right
    canvas.setFillColor(HexColor("#330b1f"))
    canvas.circle(PAGE_W * 0.85, PAGE_H * 0.85, 200, stroke=0, fill=1)
    # Lime glow lower-left
    canvas.setFillColor(HexColor("#1d2310"))
    canvas.circle(PAGE_W * 0.15, PAGE_H * 0.10, 220, stroke=0, fill=1)
    canvas.restoreState()


# ---------------------------------------------------------------------------
# Paragraph styles
# ---------------------------------------------------------------------------

base = getSampleStyleSheet()


def _style(
    name: str,
    *,
    parent=base["Normal"],
    fontName: str = "Helvetica",
    fontSize: float = 10,
    leading: float | None = None,
    textColor=INK_900,
    spaceBefore: float = 0,
    spaceAfter: float = 6,
    alignment: int = TA_LEFT,
    leftIndent: float = 0,
) -> ParagraphStyle:
    return ParagraphStyle(
        name,
        parent=parent,
        fontName=fontName,
        fontSize=fontSize,
        leading=leading or fontSize * 1.4,
        textColor=textColor,
        spaceBefore=spaceBefore,
        spaceAfter=spaceAfter,
        alignment=alignment,
        leftIndent=leftIndent,
    )


styles = {
    "cover_eyebrow": _style(
        "cover_eyebrow",
        fontName="Courier-Bold",
        fontSize=11,
        textColor=MAGENTA,
        alignment=TA_CENTER,
        spaceAfter=12,
    ),
    "cover_title": _style(
        "cover_title",
        fontName="Helvetica-Bold",
        fontSize=44,
        leading=46,
        textColor=INK_1000,
        alignment=TA_CENTER,
        spaceAfter=24,
    ),
    "cover_subtitle": _style(
        "cover_subtitle",
        fontName="Helvetica",
        fontSize=14,
        textColor=INK_800,
        alignment=TA_CENTER,
        spaceAfter=8,
    ),
    "cover_meta": _style(
        "cover_meta",
        fontName="Courier",
        fontSize=9,
        textColor=INK_500,
        alignment=TA_CENTER,
    ),
    "h1": _style(
        "h1",
        fontName="Helvetica-Bold",
        fontSize=24,
        textColor=INK_1000,
        leading=28,
        spaceBefore=20,
        spaceAfter=10,
    ),
    "h1_n": _style(
        "h1_n",
        fontName="Courier-Bold",
        fontSize=10,
        textColor=LIME,
        spaceBefore=8,
        spaceAfter=2,
    ),
    "h2": _style(
        "h2",
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=INK_1000,
        spaceBefore=14,
        spaceAfter=4,
    ),
    "body": _style(
        "body",
        fontSize=10.5,
        leading=15,
        textColor=INK_900,
        spaceAfter=4,
    ),
    "muted": _style(
        "muted",
        fontSize=9.5,
        textColor=INK_700,
        leading=14,
    ),
    "step": _style(
        "step",
        fontSize=10,
        leading=15,
        textColor=INK_900,
        leftIndent=12,
        spaceAfter=4,
    ),
    "code": _style(
        "code",
        fontName="Courier",
        fontSize=9.5,
        textColor=LIME,
        leading=14,
    ),
    "pillBody": _style(
        "pillBody",
        fontName="Courier-Bold",
        fontSize=8.5,
        textColor=INK_000,
        leading=10,
        alignment=TA_CENTER,
    ),
    "expected": _style(
        "expected",
        fontSize=10,
        leading=14,
        textColor=SUCCESS,
        leftIndent=12,
    ),
    "warn": _style(
        "warn",
        fontSize=9.5,
        leading=13,
        textColor=WARN,
    ),
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def pill(text: str, *, bg=LIME, fg=INK_000) -> Table:
    """Inline-ish lime pill with rounded look (rectangle + bold mono)."""
    para = Paragraph(
        f'<font name="Courier-Bold" color="{fg.hexval()}">{text}</font>',
        styles["pillBody"],
    )
    tbl = Table([[para]], colWidths=[None])
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), bg),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BOX", (0, 0), (-1, -1), 0, bg),
            ],
        ),
    )
    return tbl


def credentials_table() -> Table:
    rows = [
        ["Email", "Rol", "Para qué"],
        [
            "jhaider23@hotmail.com",
            "platform_admin",
            "Aprobar eventos pendientes, payouts admin",
        ],
        [
            "owner@hypepass.test",
            "owner · stage-live",
            "Editor del evento, ventas, staff, cortesías",
        ],
        [
            "manager@hypepass.test",
            "admin · stage-live",
            "Asignado como staff del festival → check-in",
        ],
        [
            "staff@hypepass.test",
            "staff · stage-live",
            "Sin acceso de check-in → debería rechazar",
        ],
        [
            "scanner@hypepass.test",
            "staff · stage-live",
            "Asignado como staff del live event → check-in",
        ],
        [
            "dj@basscollective.test",
            "owner · bass-collective",
            "Multi-tenant (solo ve eventos de bass-collective)",
        ],
        [
            "buyer@hypepass.test",
            "attendee",
            "Wallet con 4 tickets en distintos estados",
        ],
        [
            "laura@hypepass.test",
            "attendee",
            "Tiene un listing activo en marketplace",
        ],
        [
            "pedro@hypepass.test",
            "attendee",
            "Receptor de cortesía → bloqueo de resale",
        ],
    ]
    tbl = Table(rows, colWidths=[2.0 * inch, 1.7 * inch, 3.2 * inch])
    tbl.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, 0), "Courier-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 8),
                ("TEXTCOLOR", (0, 0), (-1, 0), INK_000),
                ("BACKGROUND", (0, 0), (-1, 0), LIME),
                ("FONTNAME", (0, 1), (0, -1), "Courier"),
                ("FONTSIZE", (0, 1), (-1, -1), 8.5),
                ("TEXTCOLOR", (0, 1), (-1, -1), INK_900),
                ("BACKGROUND", (0, 1), (-1, -1), INK_100),
                ("LINEBELOW", (0, 0), (-1, -1), 0.4, INK_300),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ],
        ),
    )
    return tbl


def steps(items: Iterable[str]) -> list:
    out: list = []
    for i, s in enumerate(items, 1):
        out.append(
            Paragraph(
                f'<font color="{LIME.hexval()}">{i:02d}.</font>&nbsp;&nbsp;{s}',
                styles["step"],
            )
        )
    return out


def expected(text: str) -> Paragraph:
    return Paragraph(
        f'<font color="{SUCCESS.hexval()}">✓</font>&nbsp;&nbsp;<i>{text}</i>',
        styles["expected"],
    )


def code(text: str) -> Paragraph:
    return Paragraph(text, styles["code"])


def kvbar(label: str, value: str, *, label_color=INK_700) -> Table:
    """Inline label/value strip — used for "Usuario:", "URL:", etc."""
    tbl = Table(
        [
            [
                Paragraph(
                    f'<font name="Courier-Bold" size="8.5" color="{label_color.hexval()}">{label}</font>',
                    styles["body"],
                ),
                Paragraph(
                    f'<font name="Courier" size="9" color="{INK_900.hexval()}">{value}</font>',
                    styles["body"],
                ),
            ],
        ],
        colWidths=[1.0 * inch, None],
    )
    tbl.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ],
        ),
    )
    return tbl


def divider() -> HRFlowable:
    return HRFlowable(
        width="100%",
        thickness=0.5,
        color=INK_300,
        spaceBefore=12,
        spaceAfter=10,
    )


def section_header(num: str, title: str) -> list:
    return [
        Spacer(1, 6),
        Paragraph(
            f'<font name="Courier-Bold" size="10" color="{LIME.hexval()}">◆ FLUJO {num}</font>',
            styles["body"],
        ),
        Paragraph(title, styles["h1"]),
        HRFlowable(
            width=2.0 * inch, thickness=2, color=LIME, spaceBefore=0, spaceAfter=10,
        ),
    ]


# ---------------------------------------------------------------------------
# Content blocks
# ---------------------------------------------------------------------------


def cover_story() -> list:
    glyph_path = PUBLIC / "icon.png"
    pieces: list = [Spacer(1, 1.2 * inch)]
    if glyph_path.exists():
        img = Image(str(glyph_path), width=1.6 * inch, height=1.6 * inch)
        img.hAlign = "CENTER"
        pieces.append(img)
    pieces.extend(
        [
            Spacer(1, 0.3 * inch),
            Paragraph("◆ MANUAL DE PRUEBAS", styles["cover_eyebrow"]),
            Paragraph("HypePass<br/>QA Smoke Tests", styles["cover_title"]),
            Paragraph(
                "Checklist completo de flujos para validar la app después de un seed.",
                styles["cover_subtitle"],
            ),
            Spacer(1, 0.4 * inch),
            Paragraph("LIVE EVENTS · REAL ACCESS", styles["cover_meta"]),
            Paragraph("v1 — Iteración 10", styles["cover_meta"]),
        ],
    )
    return pieces


def setup_section() -> list:
    out: list = section_header(
        "00", "Setup (correr una sola vez)"
    )
    out.extend(
        [
            Paragraph(
                "Antes de probar cualquier flujo, levanta backend, frontend y haz un reseed completo. "
                "Los eventos del seed tienen timestamps relativos a <i>now</i>: si quieres volver a probar el flujo "
                "de check-in en vivo, recorre el reseed para que el evento <code>live-now-warehouse</code> vuelva a estar "
                "en curso.",
                styles["body"],
            ),
            Spacer(1, 6),
            Paragraph("Comandos:", styles["h2"]),
            code("# Backend"),
            code("cd HypePass-BE"),
            code("yarn db:reseed     # truncate + seed (5 scripts en orden)"),
            code("yarn start:dev     # arranca Nest"),
            Spacer(1, 4),
            code("# Frontend"),
            code("cd HypePass-FE"),
            code("yarn dev           # http://localhost:8090"),
            Spacer(1, 10),
            Paragraph(
                "<b>Contraseña de todos los usuarios:</b> "
                f'<font name="Courier" color="{LIME.hexval()}">HypePass1234!</font>',
                styles["body"],
            ),
            Spacer(1, 12),
            Paragraph("Credenciales del seed", styles["h2"]),
            credentials_table(),
            Paragraph(
                "Eventos en el seed: <i>live-now-warehouse</i> (en curso), "
                "<i>indie-rooftop-sunset</i> (en 2 días, QR ya visible), "
                "<i>parallax-festival-2026</i> (festival 3 días), "
                "<i>stand-up-bogota-live</i>, <i>bass-warehouse-night</i> (otra compañía), "
                "<i>nocturno-sessions-vol-4</i> (PENDING_REVIEW), <i>wip-test-event</i> (DRAFT), "
                "<i>ended-club-session</i> (terminó hace 1 semana).",
                styles["muted"],
            ),
        ],
    )
    return out


def flow(
    num: str,
    title: str,
    *,
    user: str,
    url: str,
    description: str | None = None,
    step_list: Iterable[str],
    expected_results: Iterable[str] = (),
    notes: str | None = None,
) -> list:
    block: list = section_header(num, title)
    if description:
        block.append(Paragraph(description, styles["body"]))
        block.append(Spacer(1, 4))
    block.append(kvbar("USUARIO", user))
    block.append(kvbar("URL", url))
    block.append(Spacer(1, 8))
    block.append(Paragraph("Pasos:", styles["h2"]))
    block.extend(steps(step_list))
    if expected_results:
        block.append(Spacer(1, 4))
        block.append(Paragraph("Resultado esperado:", styles["h2"]))
        for e in expected_results:
            block.append(expected(e))
    if notes:
        block.append(Spacer(1, 4))
        block.append(Paragraph(f"<i>Nota:</i> {notes}", styles["warn"]))
    return [KeepTogether(block)]


# ---------------------------------------------------------------------------
# All flows
# ---------------------------------------------------------------------------


def flows_content() -> list:
    out: list = []

    out.extend(
        flow(
            "01",
            "Discovery — landing público",
            user="Sin login (público)",
            url="http://localhost:8090/",
            description=(
                "El landing rediseñado tiene hero con evento destacado, marquee, "
                "pullquote editorial, bento de features, how-it-works y feature image final."
            ),
            step_list=[
                "Abre /. El hero muestra el evento más próximo (live-now-warehouse).",
                "Verifica el marquee infinito (géneros + ciudades).",
                "Scroll: pullquote, bento (5 cards con tilt 3D), timeline how-it-works.",
                "Click en 'Get tickets' del hero → te lleva al detalle del evento.",
                "Click en 'Ver todos los eventos →' → te lleva a /events.",
            ],
            expected_results=[
                "Animaciones (aurora hero, marquee, ken-burns en feature image) corren sin freezes.",
                "El bombillo rojo del eyebrow 'Próximamente' parpadea.",
            ],
        )
    )

    out.extend(
        flow(
            "02",
            "Explorar eventos con filtros",
            user="Sin login (público)",
            url="http://localhost:8090/events",
            step_list=[
                "Aplica el chip 'Hoy' → debe mostrar live-now-warehouse.",
                "Aplica chip de categoría 'Música' → no rompe (antes daba 500).",
                "Escribe 'Bogo' en ciudad → debe matchear 'Bogotá' (contains + diacritics).",
                "Click en 'Filtros avanzados' → ingresa precio mín/máx + toggle 'Solo en venta'.",
                "Verifica que la URL se actualiza (/events?city=Bogo&category=musica…) — copiala y ábrela en otra pestaña.",
                "Click 'Limpiar filtros' → URL vuelve limpia.",
            ],
            expected_results=[
                "Filtros viven en la URL — bookmark/compartir reproduce el mismo estado.",
                "Cambiar a vista 'list' también persiste en la URL.",
            ],
        )
    )

    out.extend(
        flow(
            "03",
            "Compra primaria (guest)",
            user="Sin login (guest)",
            url="/events/indie-rooftop-sunset",
            step_list=[
                "Click 'Conseguir tickets'.",
                "Selecciona sesión, sección y cantidad.",
                "Submit → /checkout.",
                "Completa: nombre, email NUEVO (ej. test1@hypepass.test), teléfono, doc.",
                "Marca el checkbox de T&C + Privacidad (obligatorio).",
                "Submit → abre el widget de Wompi (en local con sandbox).",
                "Tras pagar → /checkout/result?ref=… polling cada 3s hasta APROBADO.",
            ],
            expected_results=[
                "Cuenta test1@hypepass.test queda creada en BE (Better Auth).",
                "El usuario recibe 2 emails: welcome + reset-password (de Better Auth).",
                "Se graba fila en user_consents con IP + UA.",
            ],
            notes=(
                "Si no tienes Wompi configurado en local, puedes pegar manualmente el flujo "
                "POST /checkout/verify/:ref para simular un evento aprobado."
            ),
        )
    )

    out.extend(
        flow(
            "04",
            "Wallet + QR + ticket detail",
            user="buyer@hypepass.test",
            url="/wallet",
            step_list=[
                "Login y ve a /wallet → tab 'Próximos' debe mostrar 3 tickets (live-now × 2 + indie-rooftop × 1).",
                "Tab 'Pasados' → 1 ticket de ended-club-session ya con check-in.",
                "Click en uno del live-now → /wallet/tickets/:id.",
                "QR visible AHORA mismo (rota cada 30s).",
                "Botón 'Transferir' habilitado, botón 'Vender' deshabilitado (cutoff pasado).",
                "Click en el ticket de indie-rooftop → QR también visible (qrVisibleHoursBefore = 72).",
                "Ahí botón 'Vender' SÍ funciona.",
            ],
            expected_results=[
                "El QR rota cada 30s con animación de spinner.",
                "Tab 'Pasados' muestra el badge CHECKED_IN.",
            ],
        )
    )

    out.extend(
        flow(
            "05",
            "Check-in en vivo (escaneo del QR)",
            user="scanner@hypepass.test",
            url="/checkin",
            description=(
                "Asignado como staff del evento live-now-warehouse vía seed-staff."
            ),
            step_list=[
                "Login como scanner.",
                "Abre /checkin. Pega manualmente el token del QR del buyer (otra ventana).",
                "Submit → ✓ ACEPTADO (verde).",
                "Re-escanea el MISMO token → ✗ already_checked_in (rojo).",
                "Prueba el QR del Indie Rooftop (otro evento) → ✗ wrong_event.",
                "(Opcional) usa el botón cámara para escaneo automático.",
            ],
            expected_results=[
                "El primer check-in queda registrado en checkins con result=ACCEPTED.",
                "Posteriores intentos del mismo ticket dan rejection_reason=ALREADY_CHECKED_IN.",
            ],
        )
    )

    out.extend(
        flow(
            "06",
            "Bloqueo de scan sin asignación",
            user="staff@hypepass.test",
            url="/checkin",
            step_list=[
                "Login como staff (sin asignación per-evento).",
                "Pega el token de un ticket válido y submit.",
                "Verifica el mensaje de error.",
            ],
            expected_results=[
                "BE responde 403 con errorCode=NOT_EVENT_STAFF.",
                "FE muestra: 'No estás asignado como staff de este evento. Pide al organizador que te asigne...'.",
            ],
        )
    )

    out.extend(
        flow(
            "07",
            "Transferencia entre usuarios",
            user="buyer@hypepass.test",
            url="/wallet/tickets/:ticketId (Indie Rooftop)",
            step_list=[
                "Click 'Transferir'.",
                "Email destinatario: laura@hypepass.test, nota opcional, confirmar.",
                "El ticket sale del wallet del buyer.",
                "Logout, login como laura@hypepass.test.",
                "Verifica que el ticket aparece en su /wallet con un nuevo ownership_version.",
            ],
            expected_results=[
                "ownership_version del ticket se incrementa.",
                "QR tokens anteriores quedan inválidos (qr_generation_version bumped).",
            ],
        )
    )

    out.extend(
        flow(
            "08",
            "Marketplace — comprar listing existente",
            user="buyer@hypepass.test (o guest)",
            url="/marketplace",
            description=(
                "Laura tiene un listing activo del stand-up sembrado por seed-tickets."
            ),
            step_list=[
                "Abre /marketplace y busca el listing del stand-up.",
                "Click → /marketplace/listings/:id.",
                "Click 'Comprar' → checkout Wompi (mismo flujo, type=RESALE).",
                "Tras aprobar, el ticket sale del wallet de laura y entra al del comprador.",
                "Como admin, ve a /admin/payouts → laura tiene un payout en estado PENDING_EVENT (escrow).",
            ],
            expected_results=[
                "Tras 48h después del evento, el sweeper lo promociona a PAYABLE automáticamente.",
                "Listing.status = SOLD, ticket cambia de owner.",
            ],
        )
    )

    out.extend(
        flow(
            "09",
            "Listar mi propio ticket",
            user="buyer@hypepass.test",
            url="/wallet/tickets/:id (Indie Rooftop, antes del transfer)",
            step_list=[
                "Click 'Vender'.",
                "Si no tiene payout method registrado, te redirige a /profile a crearlo.",
                "Define precio (cap = face value × 1.2).",
                "Submit → ticket cambia a status=LISTED y aparece en /marketplace.",
            ],
            expected_results=[
                "Tab 'Mis ventas' del wallet muestra el listing activo.",
                "Listing tiene fee 10%, calcula sellerNetAmount correctamente.",
            ],
        )
    )

    out.extend(
        flow(
            "10",
            "Cortesía — bloqueo de resale",
            user="pedro@hypepass.test",
            url="/wallet",
            description=(
                "Pedro recibió una cortesía del Indie Rooftop sembrada por seed-tickets "
                "(courtesy=true, faceValue=0)."
            ),
            step_list=[
                "Login como pedro y ve a /wallet → ve la cortesía con badge.",
                "Click → /wallet/tickets/:id.",
                "Botón 'Transferir' habilitado → funciona normal.",
                "Click 'Vender' → debe rechazar.",
            ],
            expected_results=[
                "Mensaje: 'Los tickets de cortesía no pueden revenderse. Puedes transferirlo a otro usuario.'.",
                "BE responde errorCode=COURTESY_NOT_RESELLABLE.",
            ],
        )
    )

    out.extend(
        flow(
            "11",
            "Organizer — editor + sales summary",
            user="owner@hypepass.test",
            url="/organizer",
            step_list=[
                "Login y ve a /organizer → SOLO eventos de stage-live (no los de bass-collective).",
                "Click parallax-festival-2026 → /organizer/companies/.../events/.../",
                "Panel 'Ventas' → conteo en vivo de capacity / sold / reserved / courtesies / available por sesión y sección.",
                "Click 'Actualizar' → re-fetcha.",
                "Toggle 'Permitir reventa' → si lo apagas, los nuevos listings dan RESALE_DISABLED.",
            ],
            expected_results=[
                "El sales summary muestra cifras consistentes con los tickets sembrados.",
                "Cada sesión del festival se contabiliza por separado.",
            ],
        )
    )

    out.extend(
        flow(
            "12",
            "Organizer — staff por evento",
            user="owner@hypepass.test",
            url="/organizer/companies/:cid/events/:eid",
            step_list=[
                "Scroll al panel 'Staff del evento' → ya hay asignaciones del seed.",
                "Click 'Asignar staff'. Modal abre.",
                "Agrega un email NUEVO (ej. nuevo-staff@hypepass.test). Submit.",
                "Pantalla de éxito: 'Cuentas nuevas creadas: 1'.",
                "Intenta agregar manager@hypepass.test (ya asignado al festival) → aviso naranja inline.",
                "Click 'Revocar' en una fila → ConfirmModal danger → confirma.",
            ],
            expected_results=[
                "BE crea la cuenta vía Better Auth + manda email reset-password.",
                "Se inserta en event_staff_assignments con assigned_by_user_id del owner.",
                "Audit log staff.assigned y staff.revoked se registran.",
            ],
        )
    )

    out.extend(
        flow(
            "13",
            "Emisión de cortesías",
            user="owner@hypepass.test",
            url="Editor del evento indie-rooftop-sunset",
            step_list=[
                "Panel 'Ventas' → click 'Emitir cortesías'.",
                "Selecciona sesión + sección.",
                "Agrega un destinatario nuevo (vip@hypepass.test) con nombre y cédula.",
                "Submit → 'Se emitieron 1 cortesía'.",
                "El contador 'Cortesías' del panel sube en 1.",
            ],
            expected_results=[
                "BE materializa ticket con courtesy=true, face_value=0.",
                "Destinatario recibe email + reset-password si era nuevo.",
            ],
        )
    )

    out.extend(
        flow(
            "14",
            "Admin — aprobar evento pendiente",
            user="jhaider23@hotmail.com (platform_admin)",
            url="/admin",
            step_list=[
                "Tab 'Eventos pendientes' → ve nocturno-sessions-vol-4.",
                "Click → /admin/events/:id (read-only con sesiones, secciones, fases).",
                "Click 'Aprobar' → PromptModal pide notas → confirma.",
                "Status pasa a APPROVED. Click 'Publicar' → PUBLISHED.",
                "Login como guest → /events ahora muestra el evento.",
            ],
            expected_results=[
                "Audit log event.approved + event.published.",
                "Email al owner notificando aprobación.",
            ],
        )
    )

    out.extend(
        flow(
            "15",
            "Admin — payouts",
            user="jhaider23@hotmail.com",
            url="/admin/payouts",
            step_list=[
                "Tabs por estado: payable / pending / paid / failed / cancelled.",
                "Selecciona uno PAYABLE → click 'Marcar pagado' → ConfirmModal → confirma.",
                "Verifica que pasa a tab 'paid'.",
                "Selecciona otro → 'Marcar fallido' o 'Cancelar' (similar).",
            ],
            expected_results=[
                "Cada acción registra audit (payout.marked_paid / payout.marked_failed / payout.cancelled).",
                "Solo se puede transicionar desde PAYABLE — los demás estados no exponen acciones.",
            ],
        )
    )

    out.extend(
        flow(
            "16",
            "Multi-tenant",
            user="dj@basscollective.test",
            url="/organizer",
            step_list=[
                "Login como DJ (owner de bass-collective).",
                "/organizer SOLO muestra bass-warehouse-night, NO los de stage-live.",
                "Intenta abrir /admin → denegado (no es platform_admin).",
            ],
            expected_results=[
                "TenantGuard del BE filtra correctamente las queries por companyId.",
            ],
        )
    )

    out.extend(
        flow(
            "17",
            "Legal + FAQ + consents",
            user="Sin login (público) + signup",
            url="/faq, /legal/terms, /legal/privacy",
            step_list=[
                "Visita /faq, /legal/terms, /legal/privacy → contenido completo en español.",
                "Banner 'BORRADOR' en las dos páginas legales.",
                "Ve a /signup, agrega email nuevo, marca el checkbox de T&C + Privacidad.",
                "Submit → cuenta creada.",
            ],
            expected_results=[
                "Fila en user_consents con term_version, privacy_version, IP, user_agent del request.",
            ],
        )
    )

    out.extend(
        flow(
            "18",
            "Reseteo del timeline",
            user="—",
            url="terminal",
            description=(
                "Como los timestamps del seed son relativos a now, el evento 'en curso' "
                "se vuelve 'pasado' después de unas horas. Re-corre el reseed cuando quieras."
            ),
            step_list=[
                "Detén el server dev del BE (Cmd+C).",
                "yarn db:reseed (truncate + 5 scripts).",
                "Arranca de nuevo: yarn start:dev.",
                "El evento live-now-warehouse vuelve a estar en curso → check-in se puede probar.",
            ],
        )
    )

    return out


def quick_matrix() -> list:
    rows = [
        ["Usuario", "URL principal", "Qué prueba"],
        ["buyer@hypepass.test", "/wallet", "4 tickets, QR, transfer, compra marketplace"],
        ["scanner@hypepass.test", "/checkin", "Check-in OK del live event"],
        ["staff@hypepass.test", "/checkin", "Rechazo NOT_EVENT_STAFF"],
        ["manager@hypepass.test", "/checkin", "Check-in del festival (cuando aplique)"],
        ["owner@hypepass.test", "/organizer/...", "Editor, ventas, staff, cortesías, toggle resale"],
        ["dj@basscollective.test", "/organizer", "Multi-tenant (solo ve bass)"],
        ["laura@hypepass.test", "/wallet", "Vendedora con listing activo"],
        ["pedro@hypepass.test", "/wallet", "Cortesía: transfer ✓ / resale ✗"],
        ["jhaider23@hotmail.com", "/admin", "Aprobar evento + payouts"],
    ]
    tbl = Table(rows, colWidths=[1.9 * inch, 1.7 * inch, 3.3 * inch])
    tbl.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, 0), "Courier-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 8.5),
                ("TEXTCOLOR", (0, 0), (-1, 0), INK_000),
                ("BACKGROUND", (0, 0), (-1, 0), LIME),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 1), (-1, -1), 9),
                ("FONTNAME", (0, 1), (0, -1), "Courier"),
                ("FONTSIZE", (0, 1), (0, -1), 8.5),
                ("TEXTCOLOR", (0, 1), (-1, -1), INK_900),
                ("BACKGROUND", (0, 1), (-1, -1), INK_100),
                ("LINEBELOW", (0, 0), (-1, -1), 0.4, INK_300),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ],
        ),
    )
    return [
        Spacer(1, 14),
        Paragraph("Matriz rápida — qué prueba cada usuario", styles["h1"]),
        HRFlowable(
            width=2.0 * inch, thickness=2, color=LIME, spaceBefore=0, spaceAfter=10,
        ),
        tbl,
    ]


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------


def build() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    doc = BaseDocTemplate(
        str(OUT_PDF),
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
        title="HypePass — Manual de Pruebas",
        author="HypePass",
    )

    cover_frame = Frame(
        MARGIN,
        MARGIN,
        PAGE_W - 2 * MARGIN,
        PAGE_H - 2 * MARGIN,
        id="cover",
        showBoundary=0,
    )
    body_frame = Frame(
        MARGIN,
        MARGIN,
        PAGE_W - 2 * MARGIN,
        PAGE_H - 2 * MARGIN,
        id="body",
        showBoundary=0,
    )
    doc.addPageTemplates(
        [
            PageTemplate(id="cover", frames=[cover_frame], onPage=_paint_cover),
            PageTemplate(id="body", frames=[body_frame], onPage=_paint_chrome),
        ],
    )

    story: list = []
    story.extend(cover_story())
    story.append(NextPageTemplate("body"))
    story.append(PageBreak())
    story.extend(setup_section())
    story.extend(flows_content())
    story.extend(quick_matrix())

    doc.build(story)
    print(f"✓ {OUT_PDF.relative_to(ROOT)} ({OUT_PDF.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
