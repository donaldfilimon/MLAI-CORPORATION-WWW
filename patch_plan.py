
from pathlib import Path
path = Path("docs/superpowers/plans/2026-09-06-mlai-site-redesign.md")
text = path.read_text()
replacements = [
    ("- [ ] Commit message if needed: `style(ui): remap Lab tokens to handoff cyan/purple/emerald + Spectral/Geist`",
     "- [x] Commit message if needed: `style(ui): remap Lab tokens to handoff cyan/purple/emerald + Spectral/Geist`"),
    ("- [ ] `bun run build:ui && bun run typecheck`\n- [ ] Commit: `chore(ui): init shadcn primitives mapped to Lab tokens`",
     "- [x] `bun run build:ui && bun run typecheck`\n- [x] Commit: `chore(ui): init shadcn primitives mapped to Lab tokens`"),
    ("- [ ] `bun run typecheck` + spot-check `bun run dev` on `/platform` `/abbey` `/abi` `/wdbx`\n- [ ] Commit + PR: `feat(site): compose Platform/Abbey/ABI/WDBX toward handoff`",
     "- [x] `bun run typecheck` + spot-check `bun run dev` on `/platform` `/abbey` `/abi` `/wdbx`\n- [x] Commit + PR: `feat(site): compose Platform/Abbey/ABI/WDBX toward handoff`"),
    ("- [ ] Playwright smoke optional; typecheck required.\n- [ ] Commit + PR: `feat(docs): sidebar shell + command palette`",
     "- [x] Playwright smoke optional; typecheck required.\n- [x] Commit + PR: `feat(docs): sidebar shell + command palette`"),
    ("- [ ] Commit + PR per page group if large.",
     "- [x] Commit + PR per page group if large."),
]
old_t6 = """## Task 6: Deferred / out of scope (track only)

- [ ] Agent-view hardcoded green hex cleanup.
- [ ] Public Console marketing gate distinct from `/sign-in` (product decision).
- [ ] Mobile Expo Chat/onboarding/WDBX console (separate app).
- [ ] Brand provenance module unlocking StatBlocks.
"""
new_t6 = """## Task 6: Deferred / out of scope (track only)

- [x] Agent-view hardcoded green hex cleanup (shipped on earlier branch / main).
- [ ] Public Console marketing gate distinct from `/sign-in` (product decision — parked).
- [ ] Mobile Expo Chat/onboarding/WDBX console (separate app — parked).
- [x] Brand provenance module (`src/content/provenance.ts` + ProvTag/ProvLegend); sourced `figures` render on `/wdbx` + `/abi`. Home Benchmarks grids still blocked until harness.
"""
closeout = """
---

## Task 7: Chrome / home closeout (this PR)

**Deliverable:** Gap map honest; footer ProvLegend + legal; home claim-safe; no Console gate; no banned grids.

- [x] Refresh `docs/design/redesign-gap.md` to shipped reality (Remaining only parked/blocked items).
- [x] PublicNav link set already design-aligned — keep Sign in / Console → `/app` / Contact CTA (no new Console marketing page).
- [x] Footer: Products / Company / External columns + ProvLegend strip + Delaware C-Corp · Orlando legal line.
- [x] Home: light composition tighten + optional ProvLegend only — **no** handoff Benchmarks / StatBlock grids.
- [ ] `bun run check` (or typecheck + tests + build); fix regressions from this slice.
- [ ] Commit + PR: `feat(site): redesign closeout — chrome, gap map, ProvLegend footer`
"""
for a,b in replacements:
    if a not in text:
        print("MISSING:", repr(a[:60]))
    else:
        text = text.replace(a,b,1)
if old_t6 not in text:
    print("MISSING Task 6 block")
else:
    text = text.replace(old_t6, new_t6, 1)
if "## Task 7:" not in text:
    text = text.rstrip() + "\n" + closeout
if not text.endswith("\n"):
    text += "\n"
path.write_text(text)
print("plan patched")
