export const nav = [
  { href: "/architecture", label: "Architecture", hint: "Layers · flow · formal model" },
  { href: "/wdbx", label: "WDBX", hint: "Vector storage" },
  { href: "/abi", label: "ABI", hint: "Compute + routing" },
  { href: "/abbey", label: "Abbey", hint: "Assistant layer" },
  { href: "/docs", label: "Docs", hint: "Diátaxis · build from source" },
  { href: "/company", label: "Company", hint: "Principles · approach" },
] as const;

export const paletteItems = [
  { href: "/", label: "Home", hint: "The thesis" },
  ...nav,
] as const;

export const routes = [
  "/", "/architecture", "/wdbx", "/abi", "/abbey", "/docs", "/company",
  "/legal/terms", "/legal/privacy",
] as const;
