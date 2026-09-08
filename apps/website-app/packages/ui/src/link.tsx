import type { AnchorHTMLAttributes, ComponentType, ReactNode } from "react";
/**
 * Navigation is injected rather than imported so the library stays free of any
 * router. Every component defaults to a plain anchor, which is what makes them
 * renderable in isolation; an application passes its own router-aware link.
 */
export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};
export type LinkComponent = ComponentType<LinkProps>;
export function Anchor({ href, children, ...rest }: LinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
