import type { ReactNode } from "react";
import { HeroBench } from "mlai-corporation-www";

/** The Lab ink ground the design system is built for. */
const Ground = ({ children }: { children: ReactNode }) => (
  <div style={{ background: "#05070d", padding: 28, borderRadius: 12 }}>{children}</div>
);

/** A retrieval turn: resolve records, pack the context, route to a persona. */
export const CliSession = () => (
  <Ground>
    <div style={{ maxWidth: 520 }}>
      <HeroBench
        prompt="$"
        lines={[
          "abi wdbx query --top-k 5 'weighted backtrace'",
          "",
          "  resolved 5 records from 3 segments",
          "  context pack assembled under budget",
          "  routed → abbey",
          "",
          "  chain verified · 0 breaks",
        ]}
      />
    </div>
  </Ground>
);

/** A different prompt string and a shorter transcript — the audit walk. */
export const AuditSession = () => (
  <Ground>
    <div style={{ maxWidth: 520 }}>
      <HeroBench
        prompt="abi ❯"
        lines={[
          "wdbx verify --chain --from genesis",
          "",
          "  walking blocks · parent hashes match",
          "  chain intact",
        ]}
      />
    </div>
  </Ground>
);
