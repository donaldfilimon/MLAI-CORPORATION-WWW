import type { ClaimStatus } from "@/content/knowledge";

const STATUS: Record<
  ClaimStatus,
  { label: string; glyph: string; className: string }
> = {
  current: { label: "Current", glyph: "●", className: "claim-status current" },
  partial: { label: "Partial", glyph: "◐", className: "claim-status partial" },
  proposed: {
    label: "Proposed",
    glyph: "○",
    className: "claim-status proposed",
  },
  "not-claimed": {
    label: "Not claimed",
    glyph: "—",
    className: "claim-status not-claimed",
  },
};

/** Claim-status chip. Status words are the repositories' own. */
export function StatusBadge({ status }: { status: ClaimStatus }) {
  const value = STATUS[status];
  return (
    <span className={value.className}>
      <span aria-hidden="true">{value.glyph}</span> {value.label}
    </span>
  );
}
