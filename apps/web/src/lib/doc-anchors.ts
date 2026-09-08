import type { DocSection } from "@/data/schemas";

/**
 * ASCII-only, hyphen-joined slug of the given text — the anchor base before
 * disambiguation. Curly quotes and other punctuation in vendored headings
 * (e.g. "Use the project's validation gate") collapse into surrounding
 * hyphens rather than surviving into the anchor.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Derive one heading anchor per body section.
 *
 * Task 1 dropped the vendored `id` field, and the vendored data's own
 * id/title pairing was already inconsistent (one section carried
 * `run-the-project-gate` against a title no slugify of the title
 * reproduces), so reproducing the original fragments is neither possible
 * nor useful — none of them were ever published under this domain. The only
 * real requirements are that an anchor is unique within the page and stable
 * across builds.
 *
 * A heading-less section, or one whose slug collapses to the empty string
 * (all-punctuation headings such as "—"), falls back to `section-${i}`.
 * Any base — heading-derived or the `section-${i}` fallback — that collides
 * with an anchor already assigned earlier in the same document is
 * disambiguated by appending an incrementing numeric suffix, checked
 * against the set of anchors actually used so far rather than against the
 * section's own index. Checking the used set (not the index) is what keeps
 * this collision-free: a raw heading that happens to end in a digit (e.g.
 * "Deploy 2") can never collide with a disambiguated duplicate of an
 * earlier "Deploy", because the suffix is chosen to avoid every anchor
 * already handed out, not just the one index that produced the base.
 */
export function sectionAnchors(body: readonly DocSection[]): string[] {
  const used = new Set<string>();
  return body.map((section, i) => {
    const slug = section.heading ? slugify(section.heading) : "";
    const base = slug || `section-${i}`;

    if (!used.has(base)) {
      used.add(base);
      return base;
    }

    let suffix = 2;
    let candidate = `${base}-${suffix}`;
    while (used.has(candidate)) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    used.add(candidate);
    return candidate;
  });
}
