import { Connection, type GenerationEvent, type PreviewStatus, type Site } from "@quasar/shared";

const memory = new Map<string, string>();

const storage = {
  async getItem(key: string) {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(key);
      if (stored) return stored;
    }
    return memory.get(key) ?? null;
  },
  async setItem(key: string, value: string) {
    memory.set(key, value);
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  },
};

/** Talks to @quasar/service only through the configured origin. Never spawns it. */
export const quasarConnection = new Connection(storage);

export function getBaseUrl() {
  return quasarConnection.origin;
}

export function setBaseUrl(url: string) {
  return quasarConnection.save(url);
}

export function listSites() {
  return quasarConnection.request<Site[]>("/api/sites");
}

export function createSite(body: { name: string; prompt: string }) {
  return quasarConnection.mutate(null, () =>
    quasarConnection.request<Site>("/api/sites", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
}

export function getSite(id: string) {
  return quasarConnection.request<Site>(`/api/sites/${encodeURIComponent(id)}`);
}

export function editSite(id: string, prompt: string) {
  return quasarConnection.mutate(id, () =>
    quasarConnection.request<Site>(`/api/sites/${encodeURIComponent(id)}/edit`, {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),
  );
}

export function getEvents(id: string, since: number) {
  return quasarConnection.request<{ events: GenerationEvent[]; next: number }>(
    `/api/sites/${encodeURIComponent(id)}/events?since=${since}`,
  );
}

export function previewStatus(id: string) {
  return quasarConnection.request<PreviewStatus>(`/api/sites/${encodeURIComponent(id)}/preview`);
}

export function previewStart(id: string) {
  return quasarConnection.mutate(id, () =>
    quasarConnection.request<PreviewStatus>(
      `/api/sites/${encodeURIComponent(id)}/preview/start`,
      { method: "POST" },
      120_000,
    ),
  );
}

export function previewStop(id: string) {
  return quasarConnection.mutate(id, () =>
    quasarConnection.request<PreviewStatus>(
      `/api/sites/${encodeURIComponent(id)}/preview/stop`,
      { method: "POST" },
      15_000,
    ),
  );
}
