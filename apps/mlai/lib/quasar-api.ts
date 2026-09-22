import { Connection, ORIGIN_KEY, type GenerationEvent, type PreviewStatus, type Site } from "@quasar/shared";

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
let connection = new Connection(storage);

/** A new document: storage is unchanged, and the origin is unread until hydrate. */
export function beginColdLoad() {
  connection = new Connection(storage);
}

/** Reads the saved origin before a screen displays it. */
export async function hydrateOrigin() {
  await connection.hydrate();
  return connection.origin;
}

export function storedOrigin() {
  return storage.getItem(ORIGIN_KEY);
}

export function getBaseUrl() {
  return connection.origin;
}

export function setBaseUrl(url: string) {
  return connection.save(url);
}

export function listSites() {
  return connection.request<Site[]>("/api/sites");
}

export function createSite(body: { name: string; prompt: string }) {
  return connection.mutate(null, () =>
    connection.request<Site>("/api/sites", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
}

export function getSite(id: string) {
  return connection.request<Site>(`/api/sites/${encodeURIComponent(id)}`);
}

export function editSite(id: string, prompt: string) {
  return connection.mutate(id, () =>
    connection.request<Site>(`/api/sites/${encodeURIComponent(id)}/edit`, {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),
  );
}

export function getEvents(id: string, since: number) {
  return connection.request<{ events: GenerationEvent[]; next: number }>(
    `/api/sites/${encodeURIComponent(id)}/events?since=${since}`,
  );
}

export function previewStatus(id: string) {
  return connection.request<PreviewStatus>(`/api/sites/${encodeURIComponent(id)}/preview`);
}

export function previewStart(id: string) {
  return connection.mutate(id, () =>
    connection.request<PreviewStatus>(
      `/api/sites/${encodeURIComponent(id)}/preview/start`,
      { method: "POST" },
      120_000,
    ),
  );
}

export function previewStop(id: string) {
  return connection.mutate(id, () =>
    connection.request<PreviewStatus>(
      `/api/sites/${encodeURIComponent(id)}/preview/stop`,
      { method: "POST" },
      15_000,
    ),
  );
}
