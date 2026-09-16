import {
  matchesPublicationTag,
  statusText,
} from "./publication-filter.ts";

export type FilterControl = {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
};

export type FilterItem = FilterControl & {
  hidden: boolean;
};

export type StatusNode = {
  textContent: string | null;
};

export function applyFilter(
  selectedButton: FilterControl,
  buttons: readonly FilterControl[],
  publications: readonly FilterItem[],
  status: StatusNode | null,
): void {
  const tag = selectedButton.getAttribute("data-filter");
  for (const other of buttons) {
    other.setAttribute("aria-pressed", String(other === selectedButton));
  }
  let shown = 0;
  for (const article of publications) {
    const visible = matchesPublicationTag(
      tag,
      article.getAttribute("data-publication-tag"),
    );
    article.hidden = !visible;
    if (visible) shown += 1;
  }
  if (status) status.textContent = statusText(shown);
}
