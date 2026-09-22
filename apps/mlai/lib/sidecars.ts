export async function probeSidecar(url: string): Promise<"available" | "unavailable"> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return response.ok ? "available" : "unavailable";
  } catch {
    return "unavailable";
  }
}
