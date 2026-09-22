import { createElement, type ReactNode } from "react";
import { mock } from "bun:test";

mock.module("next/navigation", () => ({
  useRouter() {
    return { push() {}, replace() {}, refresh() {}, back() {}, forward() {}, prefetch() {} };
  },
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  useSelectedLayoutSegment: () => null,
  useSelectedLayoutSegments: () => [],
  redirect() {},
  notFound() {},
}));

mock.module("next/link", () => ({
  default(props: { href?: unknown; children?: ReactNode; className?: string }) {
    const href = typeof props.href === "string" ? props.href : "/";
    return createElement("a", { href, className: props.className }, props.children);
  },
}));
