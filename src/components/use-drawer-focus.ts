"use client";
import { useEffect, useRef } from "react";
export function useDrawerFocus(
  open: boolean,
  selector: string,
  onClose: () => void,
  maxWidth = 767,
) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open || !window.matchMedia(`(max-width: ${maxWidth}px)`).matches)
      return;
    const root = document.querySelector<HTMLElement>(selector);
    if (!root) return;
    const previous = document.activeElement as HTMLElement | null;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    const items = () =>
      [
        ...root.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
        ),
      ].filter((x) => x.getClientRects().length);
    items()[0]?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab") return;
      const options = items(),
        first = options[0],
        last = options.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    root.addEventListener("keydown", key);
    return () => {
      root.removeEventListener("keydown", key);
      root.removeAttribute("aria-modal");
      root.removeAttribute("role");
      previous?.focus();
    };
  }, [open, selector, maxWidth]);
}
