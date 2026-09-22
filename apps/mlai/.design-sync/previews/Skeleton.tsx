import { Skeleton } from "mlai-corporation-www";

/**
 * Lab ink canvas. Skeleton is `bg-primary/10` — cyan at 10% — which only reads
 * as a placeholder against the ink ground.
 *
 * It also carries `animate-pulse`, so its opacity oscillates; a capture that
 * lands at the trough looks fainter than the component really is.
 */
const ink = {
  background: "#05070d",
  padding: 28,
  borderRadius: 12,
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
  maxWidth: 380,
} as const;

const surface = {
  border: "1px solid rgba(255,255,255,.08)",
  background: "rgba(255,255,255,.02)",
  borderRadius: 14,
  padding: 16,
} as const;

/** The loading state of a record card: avatar, title line, meta line. */
export const RecordCard = () => (
  <div style={ink}>
    <div style={surface}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Skeleton style={{ width: 44, height: 44, borderRadius: 999, flexShrink: 0 }} />
        <div style={{ display: "grid", gap: 8, flex: 1 }}>
          <Skeleton style={{ height: 12, width: "68%" }} />
          <Skeleton style={{ height: 12, width: "38%" }} />
        </div>
      </div>
      <Skeleton style={{ height: 10, width: "100%", marginTop: 16 }} />
      <Skeleton style={{ height: 10, width: "82%", marginTop: 8 }} />
    </div>
  </div>
);

/** A retrieval result list before the records resolve. */
export const ResultList = () => (
  <div style={ink}>
    <div style={{ display: "grid", gap: 14 }}>
      {[1, 2, 3].map((row) => (
        <div key={row} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Skeleton style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }} />
          <div style={{ display: "grid", gap: 7, flex: 1 }}>
            <Skeleton style={{ height: 11, width: `${88 - row * 12}%` }} />
            <Skeleton style={{ height: 9, width: `${52 - row * 8}%` }} />
          </div>
          <Skeleton style={{ width: 46, height: 18, borderRadius: 999, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  </div>
);

/** A streaming answer before the first token — text-block placeholder. */
export const TextBlock = () => (
  <div style={ink}>
    <Skeleton style={{ height: 18, width: "56%", borderRadius: 6 }} />
    <div style={{ display: "grid", gap: 9, marginTop: 18 }}>
      <Skeleton style={{ height: 10, width: "100%" }} />
      <Skeleton style={{ height: 10, width: "96%" }} />
      <Skeleton style={{ height: 10, width: "99%" }} />
      <Skeleton style={{ height: 10, width: "61%" }} />
    </div>
  </div>
);
