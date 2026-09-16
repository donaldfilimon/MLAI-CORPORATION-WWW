import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070B",
        panel: "#0A0E16",
        line: "rgba(255,255,255,0.08)",
        wdbx: "#00D4FF",
        abi: "#7C3AED",
        abbey: "#10B981",
        warn: "#F59E0B",
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        body: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbm)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
