import { applyFilter } from "./apply-filter.ts";

function queryAll<T extends Element>(selector: string): T[] {
  return Array.from(document.querySelectorAll<T>(selector));
}

function init(): void {
  const buttons = queryAll<HTMLElement>("[data-filter]");
  const publications = queryAll<HTMLElement>("[data-publication-tag]");
  if (buttons.length === 0) return;
  for (const button of buttons) {
    button.addEventListener("click", () => {
      applyFilter(
        button,
        buttons,
        publications,
        document.getElementById("publication-status"),
      );
    });
  }
}

if (typeof document !== "undefined") {
  init();
}
