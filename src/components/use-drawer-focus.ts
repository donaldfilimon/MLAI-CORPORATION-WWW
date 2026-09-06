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
    if (!open) return;
    const root = document.querySelector<HTMLElement>(selector);
    if (!root) return;
    const previous = document.activeElement as HTMLElement | null;
    const media = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const original: [string, string | null][] = [
      ["role", root.getAttribute("role")],
      ["aria-modal", root.getAttribute("aria-modal")],
      ["tabindex", root.getAttribute("tabindex")],
    ];
    const restoreAttributes = () => {
      for (const [name, value] of original) {
        if (value === null) root.removeAttribute(name);
        else root.setAttribute(name, value);
      }
    };
    const items = () =>
      [
        ...root.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
        ),
      ].filter(
        (item) => item.getClientRects().length && !item.closest("[inert]"),
      );
    const sync = () => {
      if (media.matches) {
        root.setAttribute("role", "dialog");
        root.setAttribute("aria-modal", "true");
        root.setAttribute("tabindex", "-1");
        if (!root.contains(document.activeElement))
          (items()[0] || root).focus();
      } else {
        restoreAttributes();
      }
    };
    function key(event: KeyboardEvent) {
      if (!media.matches) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close.current();
        return;
      }
      if (event.key !== "Tab") return;
      const options = items(),
        first = options[0],
        last = options.at(-1);
      if (!first) {
        event.preventDefault();
        root!.focus();
      } else if (
        !root!.contains(document.activeElement) ||
        (event.shiftKey && document.activeElement === first)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    sync();
    media.addEventListener("change", sync);
    document.addEventListener("keydown", key, true);
    return () => {
      media.removeEventListener("change", sync);
      document.removeEventListener("keydown", key, true);
      restoreAttributes();
      if (previous?.isConnected) previous.focus();
    };
  }, [open, selector, maxWidth]);
}
