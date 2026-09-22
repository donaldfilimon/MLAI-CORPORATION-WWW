"use client";

import { applyEventPage, type GenerationEvent, type PreviewStatus, type Site } from "@quasar/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSite,
  editSite,
  getBaseUrl,
  getEvents,
  getSite,
  hydrateOrigin,
  listSites,
  previewStart,
  previewStatus,
  previewStop,
  setBaseUrl,
} from "./quasar-api";

export function QuasarSites() {
  const [sites, setSites] = useState<Site[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    listSites().then(
      (result) => {
        setSites(result);
        setError(null);
      },
      (err: unknown) => setError(err instanceof Error ? err.message : String(err)),
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main>
      <p>
        <a href="/quasar/new">＋ New</a> <a href="/quasar/settings">Settings</a>
      </p>
      {error ? (
        <p>
          {error} Base URL: {getBaseUrl()} — check Settings.
        </p>
      ) : null}
      {sites && sites.length === 0 ? <p>No sites yet. Tap ＋ New to create one.</p> : null}
      <ul>
        {sites?.map((site) => (
          <li key={site.id}>
            <a href={`/quasar/site/${site.id}`}>
              {site.name} {site.slug} {site.status}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function QuasarNewSite() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const disabled = pending || name.trim().length === 0 || prompt.trim().length === 0;

  return (
    <main>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (disabled) return;
          setPending(true);
          setError(null);
          createSite({ name: name.trim(), prompt: prompt.trim() }).then(
            (site) => {
              window.location.assign(`/quasar/site/${site.id}`);
            },
            (err: unknown) => {
              setError(err instanceof Error ? err.message : String(err));
              setPending(false);
            },
          );
        }}
      >
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Prompt
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        </label>
        <button type="submit" disabled={disabled}>
          {pending ? "Creating..." : "Create site"}
        </button>
      </form>
      {error ? <p>{error}</p> : null}
    </main>
  );
}

export function QuasarSettings() {
  const [url, setUrl] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydrateOrigin().then(
      (origin) => {
        if (cancelled) return;
        setUrl(origin);
        setReady(true);
      },
      () => {
        if (!cancelled) setReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(test = false) {
    if (!ready || pending) return;
    setPending(true);
    setMessage("");
    setSaved(false);
    try {
      await setBaseUrl(url);
      setUrl(getBaseUrl());
      setSaved(true);
      if (test) {
        const sites = await listSites();
        setMessage(`Connected. ${sites.length} sites available.`);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <main>
      <label>
        Server base URL
        <input
          value={url}
          disabled={!ready || pending}
          onChange={(event) => {
            setUrl(event.target.value);
            setSaved(false);
          }}
        />
      </label>
      <button type="button" disabled={!ready || pending} onClick={() => save(false)}>
        Save
      </button>
      <button type="button" disabled={!ready || pending} onClick={() => save(true)}>
        {pending ? "Connecting…" : "Save and test connection"}
      </button>
      {message ? <p>{message}</p> : null}
      {saved ? <p>Saved on this device.</p> : null}
    </main>
  );
}

export function QuasarSite({ id }: { id: string }) {
  const [site, setSite] = useState<Site | null>(null);
  const [events, setEvents] = useState<GenerationEvent[]>([]);
  const [preview, setPreview] = useState<PreviewStatus | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const cursor = useRef(0);

  const load = useCallback(async () => {
    const nextSite = await getSite(id);
    setSite(nextSite);
    const since = cursor.current;
    const page = await getEvents(id, since);
    cursor.current = page.next;
    setEvents((current) => applyEventPage({ events: current, next: since }, since, page).events);
    setPreview(await previewStatus(id));
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const tick = () =>
      load().catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    tick();
    const interval = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [load]);

  return (
    <main>
      {error ? <p>{error}</p> : null}
      {site ? (
        <p>
          {site.name} {site.status}
        </p>
      ) : null}
      <section>
        <h2>Feed</h2>
        <ul>
          {events.map((event, index) => (
            <li key={index}>{event.type === "text" ? event.text : event.type}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Preview</h2>
        <p>{preview ? `${preview.state} ${preview.url ?? ""}` : "No preview yet."}</p>
        <button
          type="button"
          onClick={() =>
            previewStart(id).then(setPreview, (err: unknown) =>
              setError(err instanceof Error ? err.message : String(err)),
            )
          }
        >
          Start preview
        </button>
        <button
          type="button"
          onClick={() =>
            previewStop(id).then(setPreview, (err: unknown) =>
              setError(err instanceof Error ? err.message : String(err)),
            )
          }
        >
          Stop preview
        </button>
      </section>
      <section>
        <h2>Edit</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (editPrompt.trim().length === 0) return;
            editSite(id, editPrompt.trim()).then(
              (next) => {
                setSite(next);
                setEditPrompt("");
                setEvents([]);
                cursor.current = 0;
              },
              (err: unknown) => setError(err instanceof Error ? err.message : String(err)),
            );
          }}
        >
          <label>
            Prompt
            <textarea value={editPrompt} onChange={(event) => setEditPrompt(event.target.value)} />
          </label>
          <button type="submit">Send edit</button>
        </form>
      </section>
    </main>
  );
}
