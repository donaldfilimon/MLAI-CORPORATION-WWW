import { useLocation } from "react-router-dom";

/** Next.js `usePathname` stub → react-router location. */
export function usePathname(): string {
  return useLocation().pathname;
}
