#!/usr/bin/env python3
"""Brand raster asset generator — og-image.png + PWA/apple icons.

Social crawlers (Facebook, X/Twitter, LinkedIn, Slack, iMessage) do not render
SVG `og:image`s, and PWA installs want raster icons, so the canonical SVG brand
assets in `public/` are paired with PNGs produced by this script.

Reproducible pipeline (run: `bun run og`):
  1. Decompresses the self-hosted Geist variable font (node_modules
     @fontsource-variable/geist) via fontTools for body/wordmark text.
  2. Uses Spectral (the "Lab" serif display face) for the headline —
     downloaded on demand from google/fonts if not cached in .cache/fonts/.
  3. Draws the node-graph mark from the same geometry as public/logo.svg.

Outputs (all under public/):
  og-image.png            1200x630   Open Graph / Twitter card
  apple-touch-icon.png     180x180   iOS home-screen icon
  icon-192.png             192x192   PWA manifest icon
  icon-512.png             512x512   PWA manifest icon
  icon-maskable-512.png    512x512   PWA maskable icon (safe-zone padded)

Deps: Pillow, fontTools, brotli  (pip install pillow fonttools brotli)
"""

from __future__ import annotations

import io
import math
import os
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
CACHE = ROOT / ".cache" / "fonts"

# ── Brand tokens (mirror src/index.css + public/logo.svg) ────────────────────
INK = (5, 7, 13)  # #05070d canvas
INK_2 = (11, 13, 26)  # #0B0D1A canvas gradient end
CYAN = (34, 211, 238)  # #22d3ee primary
SKY = (14, 165, 233)  # #0EA5E9 mark gradient end
BLUE = (96, 165, 250)  # #60a5fa mark gradient start
VIOLET = (167, 139, 250)  # #a78bfa signature-gradient tail
DIM = (152, 162, 176)  # #98A2B0 muted text
WHITE = (255, 255, 255)


def _geist_ttf() -> Path:
    """Decompress the self-hosted Geist variable woff2 → ttf (cached)."""
    out = CACHE / "geist-var.ttf"
    if out.exists():
        return out
    from fontTools.ttLib import TTFont  # lazy import

    src = (
        ROOT
        / "node_modules"
        / "@fontsource-variable"
        / "geist"
        / "files"
        / "geist-latin-wght-normal.woff2"
    )
    CACHE.mkdir(parents=True, exist_ok=True)
    font = TTFont(src)
    font.flavor = None
    font.save(out)
    return out


def _spectral_ttf(weight: str = "Bold") -> Path:
    out = CACHE / f"Spectral-{weight}.ttf"
    if out.exists():
        return out
    CACHE.mkdir(parents=True, exist_ok=True)
    url = f"https://github.com/google/fonts/raw/main/ofl/spectral/Spectral-{weight}.ttf"
    urllib.request.urlretrieve(url, out)
    return out


def geist(size: int, weight: int = 400) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(str(_geist_ttf()), size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def spectral(size: int, weight: str = "Bold") -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(_spectral_ttf(weight)), size)


# ── Drawing helpers ──────────────────────────────────────────────────────────
def linear_gradient(size: tuple[int, int], start, end, angle_deg: float = 45.0) -> Image.Image:
    """Full-canvas linear gradient at an angle."""
    w, h = size
    img = Image.new("RGB", (w, h))
    ang = math.radians(angle_deg)
    dx, dy = math.cos(ang), math.sin(ang)
    # Project every pixel onto the gradient axis; normalize 0..1.
    proj_max = abs(dx) * w + abs(dy) * h
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = (x * dx + y * dy) / proj_max
            t = min(max(t, 0.0), 1.0)
            px[x, y] = tuple(int(s + (e - s) * t) for s, e in zip(start, end))
    return img


def radial_glow(size: tuple[int, int], center, radius, color, alpha: float) -> Image.Image:
    """Soft radial glow layer (RGBA) for compositing."""
    w, h = size
    layer = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(layer)
    steps = 64
    for i in range(steps, 0, -1):
        r = radius * i / steps
        a = int(255 * alpha * (1 - i / steps) ** 1.6)
        d.ellipse(
            (center[0] - r, center[1] - r, center[0] + r, center[1] + r), fill=a
        )
    layer = layer.filter(ImageFilter.GaussianBlur(radius / 10))
    solid = Image.new("RGBA", (w, h), color + (0,))
    solid.putalpha(layer)
    return solid


def draw_mark(canvas: Image.Image, x: int, y: int, size: int) -> None:
    """The MLAI node-graph mark — same geometry as public/logo.svg (64-unit grid)."""
    s = size / 64.0
    tile = linear_gradient((size, size), BLUE, SKY, 45).convert("RGBA")
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(15 * s * (64 / 52)), fill=255)
    # ^ logo.svg tile is 52 units at rx=15 → scale rx to the full-size tile.
    canvas.paste(tile, (x, y), mask)

    d = ImageDraw.Draw(canvas)
    # Subtle inner border (stroke-opacity .18 in the SVG).
    d.rounded_rectangle(
        (x + 1, y + 1, x + size - 2, y + size - 2),
        radius=int(15 * s * (64 / 52)),
        outline=(255, 255, 255, 46),
        width=max(1, int(1.5 * s)),
    )

    # M-shaped weighted backtrace path (mapped from the 6..58 logo viewport onto the tile).
    def pt(ux: float, uy: float) -> tuple[float, float]:
        return (x + (ux - 6) / 52 * size, y + (uy - 6) / 52 * size)

    path = [pt(19, 44), pt(19, 22), pt(32, 32), pt(45, 22), pt(45, 44)]
    lw = max(2, int(3.2 * s * (64 / 52)))
    d.line(path, fill=WHITE + (242,), width=lw, joint="curve")
    for (ux, uy, r) in [(19, 44, 4.4), (19, 22, 3.7), (32, 32, 3.2), (45, 22, 3.7), (45, 44, 4.4)]:
        cx, cy = pt(ux, uy)
        rr = r * s * (64 / 52)
        d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=WHITE)


def gradient_text(canvas: Image.Image, xy, text, font, start, end) -> None:
    """Render text filled with a horizontal gradient."""
    bbox = ImageDraw.Draw(canvas).textbbox(xy, text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    grad = linear_gradient((max(w, 1), max(h, 1)), start, end, 0).convert("RGBA")
    mask = Image.new("L", canvas.size, 0)
    ImageDraw.Draw(mask).text(xy, text, font=font, fill=255)
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    layer.paste(grad, (bbox[0], bbox[1]))
    canvas.paste(layer, (0, 0), mask)


# ── Assets ───────────────────────────────────────────────────────────────────
def build_og() -> None:
    W, H = 1200, 630
    img = linear_gradient((W, H), INK, INK_2, 28).convert("RGBA")
    img.alpha_composite(radial_glow((W, H), (980, 120), 620, CYAN, 0.26))
    img.alpha_composite(radial_glow((W, H), (140, 620), 420, VIOLET, 0.10))
    d = ImageDraw.Draw(img)

    # Hairline frame.
    d.rectangle((0, 0, W - 1, H - 1), outline=(255, 255, 255, 16), width=1)

    # Faint constellation (echoes the hero galaxy) in the glow quadrant.
    import random

    rng = random.Random(7)
    stars = [(rng.randint(700, 1160), rng.randint(60, 340)) for _ in range(26)]
    for i, (sx, sy) in enumerate(stars):
        for tx, ty in stars[i + 1 :]:
            if (sx - tx) ** 2 + (sy - ty) ** 2 < 130**2:
                d.line((sx, sy, tx, ty), fill=CYAN + (26,), width=1)
    for sx, sy in stars:
        r = rng.choice((1.5, 2, 2.5))
        d.ellipse((sx - r, sy - r, sx + r, sy + r), fill=CYAN + (120,))

    # Brand mark + wordmark.
    draw_mark(img, 96, 92, 112)
    d = ImageDraw.Draw(img)
    wm = geist(44, 700)
    d.text((232, 122), "MLAI", font=wm, fill=WHITE)
    ml_w = d.textlength("MLAI ", font=wm)
    d.text((232 + ml_w, 122), "CORPORATION", font=wm, fill=DIM)

    # Headline — Spectral serif, the Lab signature.
    h1 = spectral(84, "Bold")
    d.text((96, 268), "Infrastructure for", font=h1, fill=WHITE)
    gradient_text(img, (96, 366), "resilient intelligence.", h1, CYAN, VIOLET)
    d = ImageDraw.Draw(img)

    # Subline + product line.
    d.text(
        (96, 496),
        "Private, traceable AI infrastructure for production teams.",
        font=geist(31, 400),
        fill=DIM,
    )
    d.text(
        (96, 548),
        "WDBX retrieval  ·  Abbey · Aviva · Abi orchestration  ·  operator-ready controls",
        font=geist(22, 500),
        fill=(122, 132, 148),
    )

    img.convert("RGB").save(PUBLIC / "og-image.png", optimize=True)
    print(f"  og-image.png            1200x630  {_kb(PUBLIC / 'og-image.png')}")


def build_icon(size: int, name: str, pad_ratio: float = 0.0) -> None:
    """Square icon: the mark tile fills the canvas (optionally safe-zone padded)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pad = int(size * pad_ratio)
    if pad:
        # Maskable: solid ink plate behind, mark inside the 80% safe zone.
        plate = linear_gradient((size, size), INK, INK_2, 45).convert("RGBA")
        img.alpha_composite(plate)
    draw_mark(img, pad, pad, size - 2 * pad)
    img.save(PUBLIC / name, optimize=True)
    print(f"  {name:<22}  {size}x{size}  {_kb(PUBLIC / name)}")


def _kb(p: Path) -> str:
    return f"{p.stat().st_size / 1024:.0f} KB"


def main() -> int:
    print("MLAI brand raster assets → public/")
    build_og()
    build_icon(180, "apple-touch-icon.png")
    build_icon(192, "icon-192.png")
    build_icon(512, "icon-512.png")
    build_icon(512, "icon-maskable-512.png", pad_ratio=0.12)
    return 0


if __name__ == "__main__":
    sys.exit(main())
