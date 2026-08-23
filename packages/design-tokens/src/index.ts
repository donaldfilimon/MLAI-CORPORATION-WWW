import type { ProductAccent } from "@mlai/contracts";

/** Raw Lab colors only. Each app keeps its platform-specific semantic tokens. */
export const labColor = {
  ink: "#05070D",
  cyan: "#22D3EE",
  violet: "#A855F7",
  emerald: "#34D399",
  amber: "#FBBF24",
} as const;

export const productColor: Record<ProductAccent, string> = {
  wdbx: labColor.cyan,
  abi: labColor.violet,
  abbey: labColor.emerald,
};
