import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

type Props = {
  href: string;
  children?: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

/** Next.js `Link` stub → react-router for in-app SPA navigation. */
export default function Link({ href, children, ...rest }: Props) {
  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    const isHttp = /^https?:/i.test(href);
    return (
      <a
        href={href}
        {...(isHttp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <RouterLink to={href} {...rest}>
      {children}
    </RouterLink>
  );
}
