const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type SiteverifyResult = {
  success?: boolean;
  action?: string;
  hostname?: string;
};

function expectedHostnames() {
  return new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean),
  );
}

function requesterIp(req: Request) {
  const connectingIp = req.headers.get("cf-connecting-ip")?.trim();
  if (connectingIp) return connectingIp;
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
}

export async function verifyTurnstile(req: Request, token: string, expectedAction: string) {
  const secret = process.env.TURNSTILE_SECRET?.trim() ?? "";
  const hostnames = expectedHostnames();
  if (!secret || hostnames.size === 0 || token.length < 10 || token.length > 4096) return false;

  const remoteip = requesterIp(req);
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(remoteip ? { remoteip } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as SiteverifyResult;
    return (
      result.success === true &&
      result.action === expectedAction &&
      typeof result.hostname === "string" &&
      hostnames.has(result.hostname.toLowerCase())
    );
  } catch (error) {
    console.error("Turnstile verification failed closed:", error instanceof Error ? error.message : "unknown error");
    return false;
  }
}
