import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { z } from "zod";
import { randomBytes } from "node:crypto";
export const dataDir = resolve(
  /* turbopackIgnore: true */ process.env.MLAI_DATA_DIR || ".data",
);
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
export const appUrl = process.env.APP_URL || "http://127.0.0.1:3100";
const secretPath = join(dataDir, "auth-secret");
if (!existsSync(secretPath)) {
  try {
    writeFileSync(secretPath, randomBytes(48).toString("base64url"), {
      mode: 0o600,
      flag: "wx",
    });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
  }
}
export const authSecret =
  process.env.BETTER_AUTH_SECRET || readFileSync(secretPath, "utf8").trim();
export const uploadsDir = join(dataDir, "documents");
export const deliveriesDir = join(dataDir, "deliverables");
for (const dir of [uploadsDir, deliveriesDir])
  mkdirSync(dir, { recursive: true, mode: 0o700 });
export const maxUpload =
  z.coerce
    .number()
    .positive()
    .max(2048)
    .parse(process.env.MAX_UPLOAD_MB || 100) *
  1024 *
  1024;
export interface Connection {
  id: string;
  name: string;
  kind: "local" | "hosted" | "abi" | "wdbx";
  url?: string;
  model?: string;
  keyEnv?: string;
  binary?: string;
  tokenFile?: string;
  caFile?: string;
  certFile?: string;
  keyFile?: string;
}
export function connections(): Connection[] {
  const path =
    process.env.MLAI_CONNECTIONS_FILE || join(dataDir, "connections.json");
  if (!existsSync(/* turbopackIgnore: true */ path))
    return [
      {
        id: "mlx",
        name: "MLX Core",
        kind: "local",
        url: process.env.MLAI_LOCAL_MODEL_URL || "http://127.0.0.1:8080/v1",
        model: process.env.MLAI_LOCAL_MODEL_ID || "",
      },
    ];
  const value: unknown = JSON.parse(
    readFileSync(/* turbopackIgnore: true */ path, "utf8"),
  );
  const schema = z.array(
    z
      .object({
        id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
        name: z.string().min(1).max(120),
        kind: z.enum(["local", "hosted", "abi", "wdbx"]),
        url: z.string().optional(),
        model: z.string().optional(),
        keyEnv: z
          .string()
          .regex(/^[A-Z][A-Z0-9_]*$/)
          .optional(),
        binary: z.string().optional(),
        tokenFile: z.string().optional(),
        caFile: z.string().optional(),
        certFile: z.string().optional(),
        keyFile: z.string().optional(),
      })
      .strict(),
  );
  const parsed = schema.parse(value);
  if (new Set(parsed.map((c) => c.id)).size !== parsed.length)
    throw new Error("Connection IDs must be unique.");
  for (const c of parsed)
    if (
      !!c.keyFile !== !!c.certFile ||
      ((c.keyFile || c.certFile) && !c.caFile)
    )
      throw new Error(
        "mTLS connections require caFile, certFile and keyFile together.",
      );
  return parsed;
}
export function connection(id: string) {
  return connections().find((c) => c.id === id);
}
