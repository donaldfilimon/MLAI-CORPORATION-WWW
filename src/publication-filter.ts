export const ALL_TAG = "All";

export function matchesPublicationTag(
  selectedTag: string | null,
  publicationTag: string | null,
): boolean {
  return selectedTag === ALL_TAG || publicationTag === selectedTag;
}

export function statusText(shown: number): string {
  return shown === 0
    ? "No publications match that tag."
    : `${shown} publications shown.`;
}
