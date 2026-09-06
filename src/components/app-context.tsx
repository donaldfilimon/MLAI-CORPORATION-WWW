"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Bootstrap } from "@/lib/types";
export interface AppContextValue {
  data: Bootstrap;
  refresh: () => Promise<void>;
  url: (path: string) => string;
  api: <T>(path: string, method?: string, data?: unknown) => Promise<T>;
  upload: <T>(path: string, file: File) => Promise<T>;
  switchWorkspace: (id: string) => void;
}
export const AppContext = createContext<AppContextValue | null>(null);
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("Missing workspace context");
  return value;
}
export function useData<T>(path: string | null) {
  const { api } = useApp();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!path) return;
    try {
      const value = await api<T>(path);
      setData(value);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [api, path]);
  useEffect(() => {
    setData(null);
    setError("");
    setLoading(true);
    void reload();
  }, [reload]);
  return { data, setData, error, loading, reload };
}
export function date(value: number | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
export function locationLabel(location: Record<string, unknown>) {
  return Object.entries(location)
    .map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)} ${v}`)
    .join(" · ");
}
export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="error">
      {message}
    </p>
  ) : null;
}
export function Status({ value }: { value: string }) {
  return (
    <span className={`status status-${value}`}>
      <i />
      {value.replace(/_/g, " ")}
    </span>
  );
}
