import {
  PROVENANCE,
  PROVENANCE_ORDER,
  type Provenance,
} from "@/content/provenance";

/** Provenance chip that accompanies a published figure. */
export function ProvTag({
  tag,
  className = "",
}: {
  tag: Provenance;
  className?: string;
}) {
  const { glyph, label } = PROVENANCE[tag];
  return (
    <span className={`prov-tag ${tag} ${className}`.trim()}>
      <span aria-hidden="true">{glyph}</span> {label}
    </span>
  );
}

/**
 * Legend for ● measured / ○ target / ◆ reported.
 * `chips` for page content; `inline` for compact footer-style rows.
 */
export function ProvLegend({
  variant = "chips",
  className = "",
}: {
  variant?: "chips" | "inline";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <p className={`prov-legend inline ${className}`.trim()}>
        {PROVENANCE_ORDER.map((key, i) => {
          const { glyph, label, description } = PROVENANCE[key];
          return (
            <span key={key}>
              {i > 0 ? " · " : null}
              <span aria-hidden="true">{glyph}</span> {label}
              <span className="prov-legend-gloss"> — {description}</span>
            </span>
          );
        })}
      </p>
    );
  }

  return (
    <ul className={`prov-legend chips ${className}`.trim()}>
      {PROVENANCE_ORDER.map((key) => {
        const { description } = PROVENANCE[key];
        return (
          <li key={key}>
            <ProvTag tag={key} />
            <span className="prov-legend-gloss">{description}</span>
          </li>
        );
      })}
    </ul>
  );
}