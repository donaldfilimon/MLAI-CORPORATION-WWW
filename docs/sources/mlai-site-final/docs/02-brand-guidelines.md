# MLAI Brand Guidelines

How the MLAI mark, color, type, and voice are used — and the few hard rules that protect the brand's credibility.

---

## 1. The logo

### The mark
An Apple-flat **rounded-square chip** holding **three nested layers**. The layers, bottom to top, are cyan / violet / emerald — the same order the products stack on silicon (storage → compute → application). The notches top and bottom read as chip pins. The mark encodes the company thesis literally: **three layers, one chip.**

### Variants
- **Full-color mark** — gradient chip outline + three solid color layers. Default on dark.
- **Mono mark** — single-color, inherits `currentColor`. For one-color contexts, embossing, favicons where color is unavailable.
- **Lockup** — mark + `MLAI` wordmark, horizontal. The primary signature in the nav and footer.

Files: `public/brand/mlai-mark.svg`, `mlai-mark-mono.svg`, `mlai-lockup.svg`. React: `components/Logo.tsx` (`LogoMark`, `Logo`).

### Wordmark
`MLAI` set in **Sora Bold**, letter-spacing `0.18–0.20em`, all caps. Never re-spaced tighter; the open tracking is part of the identity.

### Clear space & minimum size
Maintain clear space equal to the height of one chip-layer bar on all sides. Minimum legible mark size is **24px**; below that, prefer the mono mark. The mark has been verified legible at 28px (nav) and on white.

### Logo don'ts
- Don't recolor the layers outside the cyan/violet/emerald set.
- Don't add drop shadows, bevels, or glows to the mark.
- Don't stretch, rotate, or skew.
- Don't place the full-color mark on a busy photographic background — use the mono mark.
- Don't pair the mark with a tagline lockup that implies any third-party endorsement.

---

## 2. Color

Primary surface is near-black `ink #05070B`; raised surfaces `panel #0A0E16`. The three product accents — **WDBX cyan `#00D4FF`**, **ABI violet `#7C3AED`**, **Abbey emerald `#10B981`** — are used **one per product context**. They appear together only in the logo, the homepage stack grid, and the footer seam.

Amber `#F59E0B` is reserved for the "target" provenance state and is **not** a general accent.

---

## 3. Typography

- **Sora** — display and the wordmark.
- **Manrope** — body and UI.
- **JetBrains Mono** — code, metrics, eyebrows, and provenance tags.

Headlines are tight-tracked and sentence-case ("The fastest vector database alive."). Eyebrows are mono, uppercase, wide-tracked, with a leading accent tick.

---

## 4. The integrity rules (non-negotiable)

These exist because the brand's entire promise is *trust*. Breaking them costs more than any single asset is worth.

### 4.1 Apple framing
The **only** permitted phrasing is: *"Built on Apple's public frameworks — Metal, Accelerate, Core ML."* Never imply partnership, endorsement, sponsorship, or employment affiliation with Apple. No "Apple-backed," no Apple logos, no "in collaboration with."

### 4.2 Benchmark provenance
Every number is tagged measured / target / reported and the three are never conflated. A **target is never presented as a result.** The "295×" GPU figure and all forward ARR/unit-economics numbers are **targets** and must read as such.

### 4.3 License
The WDBX / ABI core is **Apache-2.0**, not MIT. State it correctly.

### 4.4 Versioning
Zig is referenced as **0.17-dev** (or the exact pinned `0.17.0-dev.…` string). Never a stale version.

---

## 5. Logo asset checklist

| Asset | Path | Use |
|---|---|---|
| Color mark | `public/brand/mlai-mark.svg` | Dark UI, favicons |
| Mono mark | `public/brand/mlai-mark-mono.svg` | One-color, embossing |
| Lockup | `public/brand/mlai-lockup.svg` | Headers, signatures, decks |
| Favicon | `app/icon.svg` | Browser tab (auto-served by Next) |
