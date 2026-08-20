import path from "node:path";
import os from "node:os";
import Anthropic from "@anthropic-ai/sdk";
import { createServer } from "./server";
import { PreviewManager } from "./preview";
import { runGeneration, type EngineClient } from "./engine";

const home = process.env.QUASAR_HOME ?? path.join(os.homedir(), ".quasar");
const templateDir = new URL("../../../templates/next-site", import.meta.url).pathname;
const preview = new PreviewManager();
const server = createServer({ home, templateDir, engine: runGeneration, makeClient: () => new Anthropic() as unknown as EngineClient, preview, scaffoldInstall: true, port: Number(process.env.PORT ?? 4700) });
console.log(`quasar service on http://localhost:${server.port}`);
const shutdown = async () => { await preview.stopAll(); process.exit(0); };
process.on("SIGINT", shutdown); process.on("SIGTERM", shutdown);
