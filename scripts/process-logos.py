#!/usr/bin/env python3
"""
Replace the solid black background of the brand assets with transparency,
extract the icon glyph from main-logo, and regenerate the favicon.

Input:  public/main-logo.png
        public/alternative-logo-black.png
        public/alternative-logo-white.png  (has a white rounded panel — only
                                            the surrounding black is stripped,
                                            the black glyph inside is kept)
        public/stacked-logo.png

Output: public/main-logo-transparent.png
        public/alternative-logo-black-transparent.png
        public/alternative-logo-white-transparent.png
        public/stacked-logo-transparent.png
        public/icon.png              (circular glyph, ~512px)
        public/favicon.png           (icon downscaled to 64px)
"""

from pathlib import Path
from PIL import Image, ImageDraw

PUBLIC = Path(__file__).resolve().parent.parent / "public"


def remove_black_background_by_threshold(
    input_path: Path,
    output_path: Path,
    hard_low: int = 18,
    hard_high: int = 50,
) -> None:
    """Per-pixel alpha based on max(r,g,b):
       < hard_low  → alpha 0 (dead black)
       > hard_high → alpha 255 (fully opaque)
       in between  → linear ramp (soft edges, kills banding without halos).
    """
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    span = max(1, hard_high - hard_low)
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            mx = max(r, g, b)
            if mx <= hard_low:
                new_a = 0
            elif mx >= hard_high:
                new_a = a
            else:
                new_a = int((mx - hard_low) * 255 / span)
                if new_a > a:
                    new_a = a
            pixels[x, y] = (r, g, b, new_a)
    img.save(output_path)
    print(f"  ✓ {output_path.name}")


def remove_only_surrounding_black(
    input_path: Path,
    output_path: Path,
    corner_threshold: int = 60,
) -> None:
    """Flood-fill from each corner with full transparency. Only the contiguous
    black around the white panel gets killed — the black glyph inside stays
    untouched because it's not reachable from the corners."""
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    transparent = (0, 0, 0, 0)
    for seed in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        ImageDraw.floodfill(img, seed, transparent, thresh=corner_threshold)
    img.save(output_path)
    print(f"  ✓ {output_path.name}")


def extract_icon_from_stacked(
    stacked_transparent_path: Path,
    output_path: Path,
) -> Image.Image:
    """Crop the circular glyph from the STACKED logo (not the main wordmark).

    The stacked variant ships with the full icon uncropped, whereas the main
    wordmark has a slight left-edge clip. We crop the middle ~55% vertical
    band (skipping the "STACKED LOGO" label on top and the "HYPEPASS" text +
    tagline on the bottom), then bbox-trim, then pad into a square canvas
    with breathing room for favicon / avatar usage."""
    img = Image.open(stacked_transparent_path).convert("RGBA")
    w, h = img.size
    # Crop a tight central window: the icon is centered horizontally. This
    # also excludes the "STACKED LOGO" design label from the upper-left
    # corner and the HYPEPASS text at the bottom.
    middle_band = img.crop(
        (int(w * 0.30), int(h * 0.22), int(w * 0.80), int(h * 0.58)),
    )
    bbox = middle_band.getbbox()
    if bbox is None:
        raise RuntimeError(
            "Middle band is fully transparent — can't extract icon.",
        )
    trimmed = middle_band.crop(bbox)
    # Pad to a square canvas WITH BREATHING ROOM so the glyph doesn't touch
    # the edges when rendered at small sizes.
    tw, th = trimmed.size
    padding_ratio = 0.12  # 12% of the long side, on every side
    content_side = max(tw, th)
    pad = int(content_side * padding_ratio)
    side = content_side + pad * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(
        trimmed,
        (pad + (content_side - tw) // 2, pad + (content_side - th) // 2),
        trimmed,
    )
    target = 512
    if side > target:
        canvas = canvas.resize((target, target), Image.LANCZOS)
    canvas.save(output_path)
    print(f"  ✓ {output_path.name} ({canvas.size[0]}×{canvas.size[1]})")
    return canvas


def _find_text_bounds(
    img: Image.Image,
    white_threshold: int = 200,
    min_pixels_per_col: int = 6,
) -> tuple[int, int]:
    """Scan the image columnwise to find where the white HYPEPASS text starts
    and ends, ignoring the magenta glow that bleeds in from the original icon.
    Returns (start_x, end_x_exclusive)."""
    w, h = img.size
    pixels = img.load()

    def col_has_text(x: int) -> bool:
        whites = 0
        for y in range(h):
            r, g, b, a = pixels[x, y]
            if (
                a > 80
                and r >= white_threshold
                and g >= white_threshold
                and b >= white_threshold
            ):
                whites += 1
                if whites >= min_pixels_per_col:
                    return True
        return False

    start = 0
    for x in range(w):
        if col_has_text(x):
            start = x
            break
    end = w
    for x in range(w - 1, start, -1):
        if col_has_text(x):
            end = x + 1
            break
    return start, end


def make_compact_wordmark(
    main_transparent_path: Path,
    icon_img: Image.Image,
    output_path: Path,
) -> None:
    """Build the compact navbar variant: CLEAN icon (from the stacked export,
    passed in) + "HYPEPASS" text (cropped from the main export). The main
    export's own icon is left-clipped at the canvas edge so we avoid using
    it — we only reuse the HYPEPASS text region.

    Detecting the text bounds: we cannot use a fixed X offset because the
    magenta glow tail of the original icon crosses into the 25–30% range and
    `getbbox()` would treat it as opaque content. Instead we scan column by
    column for white pixels (the text) — that ignores the pink halo and
    catches the leftmost edge of the H precisely."""
    main = Image.open(main_transparent_path).convert("RGBA")
    mw, mh = main.size

    # Drop the tagline band (bottom ~35%) so we only scan the wordmark row.
    band = main.crop((0, 0, mw, int(mh * 0.65)))

    text_start_x, text_end_x = _find_text_bounds(band)
    if text_end_x <= text_start_x:
        raise RuntimeError("Could not locate HYPEPASS text in the wordmark.")

    text_crop = band.crop((text_start_x, 0, text_end_x, band.size[1]))
    text_bbox = text_crop.getbbox()
    if text_bbox is None:
        raise RuntimeError("Text crop is fully transparent.")
    text = text_crop.crop(text_bbox)
    tw, th = text.size

    # Resize the clean icon so it sits slightly taller than the text (the
    # ring naturally looks balanced when ~1.6× the cap height of HYPEPASS).
    icon_target_h = int(th * 1.6)
    ih, iw = icon_img.size[1], icon_img.size[0]
    aspect = iw / ih
    icon_target_w = int(icon_target_h * aspect)
    icon = icon_img.resize(
        (icon_target_w, icon_target_h), Image.LANCZOS,
    )

    gap = int(icon_target_w * 0.10)  # small breathing room between icon + text
    content_h = max(icon_target_h, th)
    content_w = icon_target_w + gap + tw

    # Compose into a canvas with vertical breathing room so nothing clips
    # when the navbar scales the image down to ~36px height.
    v_pad = int(content_h * 0.12)
    out_w = content_w
    out_h = content_h + v_pad * 2
    canvas = Image.new("RGBA", (out_w, out_h), (0, 0, 0, 0))
    canvas.paste(icon, (0, v_pad + (content_h - icon_target_h) // 2), icon)
    canvas.paste(
        text,
        (icon_target_w + gap, v_pad + (content_h - th) // 2),
        text,
    )
    canvas.save(output_path)
    print(f"  ✓ {output_path.name} ({canvas.size[0]}×{canvas.size[1]})")


def write_favicon(icon_img: Image.Image, output_path: Path, size: int = 64) -> None:
    fav = icon_img.resize((size, size), Image.LANCZOS)
    fav.save(output_path)
    print(f"  ✓ {output_path.name} ({size}×{size})")


def main() -> None:
    print("→ Processing logos in", PUBLIC)

    # 1. Main logo (soft threshold: the magenta glow on the right of the glyph
    #    must be preserved).
    remove_black_background_by_threshold(
        PUBLIC / "main-logo.png",
        PUBLIC / "main-logo-transparent.png",
    )

    # 2. Alternative black — pure monochrome (white on black), threshold fine.
    remove_black_background_by_threshold(
        PUBLIC / "alternative-logo-black.png",
        PUBLIC / "alternative-logo-black-transparent.png",
    )

    # 3. Alternative white — black OUTSIDE the cream panel only. Flood-fill.
    remove_only_surrounding_black(
        PUBLIC / "alternative-logo-white.png",
        PUBLIC / "alternative-logo-white-transparent.png",
    )

    # 4. Stacked — same soft threshold as main.
    remove_black_background_by_threshold(
        PUBLIC / "stacked-logo.png",
        PUBLIC / "stacked-logo-transparent.png",
    )

    # 5. Extract the lime/magenta glyph from the STACKED variant — that
    #    export has the icon uncropped, unlike the main wordmark whose left
    #    edge is slightly clipped.
    icon = extract_icon_from_stacked(
        PUBLIC / "stacked-logo-transparent.png",
        PUBLIC / "icon.png",
    )

    # 5b. Compact wordmark without the tagline, for the navbar. We reuse the
    #     clean icon from the stacked export so the compact variant doesn't
    #     inherit the left-edge clip of the main wordmark's own icon.
    make_compact_wordmark(
        PUBLIC / "main-logo-transparent.png",
        icon,
        PUBLIC / "main-logo-compact.png",
    )

    # 6. Favicon — 64×64 PNG (html references /favicon.png).
    write_favicon(icon, PUBLIC / "favicon.png", size=64)

    print("✓ Done.")


if __name__ == "__main__":
    main()
