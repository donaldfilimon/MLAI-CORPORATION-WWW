import type { GenerationEvent, PreviewStatus, Site } from "@quasar/shared";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Connection } from "@quasar/shared";
export const connection = new Connection(AsyncStorage);
export const getBaseUrl = () => connection.origin;
export const setBaseUrl = (url: string) => connection.save(url);
const request = <T>(path: string, init?: RequestInit, timeout?: number) => connection.request<T>(path, init, timeout);
export const testConnection = () => listSites();
export async function recoverConnection() {
  await connection.recover(async (id) => {
    const sites = await listSites();
    if (id && sites.some(site => site.id === id)) {
      await getSite(id);
      await previewStatus(id);
    }
  });
}

export async function listSites(): Promise<Site[]> {
  return request<Site[]>("/api/sites");
}

export async function createSite(body: { name: string; prompt: string }): Promise<Site> {
  return connection.mutate(null, () => request<Site>("/api/sites", {
    method: "POST",
    body: JSON.stringify(body),
  }));
}

export async function getSite(id: string): Promise<Site> {
  return request<Site>(`/api/sites/${encodeURIComponent(id)}`);
}

export async function editSite(id: string, prompt: string): Promise<Site> {
  return connection.mutate(id, () => request<Site>(`/api/sites/${encodeURIComponent(id)}/edit`, {
    method: "POST",
    body: JSON.stringify({ prompt }),
  }));
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
  return connection.mutate(id, () => request<PreviewStatus>(`/api/sites/${encodeURIComponent(id)}/preview/start`, {
    method: "POST",
  }, 120000));
}

export async function previewStop(id: string): Promise<PreviewStatus> {
  return connection.mutate(id, () => request<PreviewStatus>(`/api/sites/${encodeURIComponent(id)}/preview/stop`, {
    method: "POST",
  }, 15000));
}

export async function deleteSite(id: string): Promise<void> {
  return connection.mutate(id, () => request<void>(`/api/sites/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }));
}
