import { NextUp } from "mlai-corporation-www";

const ink = { background: "#05070d", padding: 28, borderRadius: 12, maxWidth: 760 };

export const Default = () => (
  <div style={ink}>
    <NextUp
      items={[
        {
          label: "WDBX",
          href: "/products/abi",
          desc: "Durable vector and block memory with provenance-tagged figures.",
          accent: "wdbx",
        },
        {
          label: "ABI",
          href: "/docs",
          desc: "Query planning and the CLI/MCP tool surface around the store.",
          accent: "abi",
        },
        {
          label: "Abbey",
          href: "/products/abbey",
          desc: "Persona-routed agent layer across Abbey, Aviva, and Abi.",
          accent: "abbey",
        },
        {
          label: "Research",
          href: "/research",
          desc: "Papers and notes behind the architecture, with cited figures.",
          accent: "abi",
        },
      ]}
    />
  </div>
);

/** Two items fill one row of the 2-up grid — the end-of-article default. */
export const Pair = () => (
  <div style={ink}>
    <NextUp
      items={[
        {
          label: "Architecture",
          href: "/docs",
          desc: "How the index, the write-ahead log, and the audit chain stay separate.",
          accent: "wdbx",
        },
        {
          label: "Personas",
          href: "/products/abbey",
          desc: "The three registers Abi routes between, and where each one fits.",
          accent: "abbey",
        },
      ]}
    />
  </div>
);
