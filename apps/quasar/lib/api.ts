import type { GenerationEvent, PreviewStatus, Site } from "@quasar/shared";

let baseUrl = "http://localhost:4700";

export function getBaseUrl(): string {
  return baseUrl;
}

export function setBaseUrl(url: string): void {
  baseUrl = url;
}

async function request<T>(
  path: string,
  init?: Omit<RequestInit, "headers">
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
    },
  });

  if (!res.ok) {
    const bodyText = await res.text();
    throw new Error(bodyText);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function listSites(): Promise<Site[]> {
  return request<Site[]>("/api/sites");
}

export async function createSite(body: { name: string; prompt: string }): Promise<Site> {
  return request<Site>("/api/sites", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getSite(id: string): Promise<Site> {
  return request<Site>(`/api/sites/${encodeURIComponent(id)}`);
}

export async function editSite(id: string, prompt: string): Promise<Site> {
  return request<Site>(`/api/sites/${encodeURIComponent(id)}/edit`, {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

export async function getEvents(
  id: string,
  since: number
): Promise<{ events: GenerationEvent[]; next: number }> {
  return request<{ events: GenerationEvent[]; next: number }>(
    `/api/sites/${encodeURIComponent(id)}/events?since=${since}`
  );
}

export async function previewStatus(id: string): Promise<PreviewStatus> {
  return request<PreviewStatus>(`/api/sites/${encodeURIComponent(id)}/preview`);
}

export async function previewStart(id: string): Promise<PreviewStatus> {
  return request<PreviewStatus>(`/api/sites/${encodeURIComponent(id)}/preview/start`, {
    method: "POST",
  });
}

export async function previewStop(id: string): Promise<PreviewStatus> {
  return request<PreviewStatus>(`/api/sites/${encodeURIComponent(id)}/preview/stop`, {
    method: "POST",
  });
}

export async function deleteSite(id: string): Promise<void> {
  return request<void>(`/api/sites/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
