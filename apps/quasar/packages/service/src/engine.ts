import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { listSiteFiles, readSiteFile, writeSiteFile } from "./siteFs";
import type { GenerationEvent } from "@quasar/shared";
import { buildSystemPrompt } from "./systemPrompt";

// The tool runner is invoked with `stream: true` (required at max_tokens
// 64000 — see mapEngineError / runGeneration below), which makes it yield
// one stream handle per turn instead of one message per turn. Each stream
// handle exposes `finalMessage()`, resolving to the same `{content}` shape
// a non-streaming turn would have yielded directly.
export interface EngineStream {
  finalMessage(): Promise<{ content: unknown[] }>;
}

export interface EngineClient {
  beta: {
    messages: {
      toolRunner: (params: Record<string, unknown>) => AsyncIterable<EngineStream> & { done(): Promise<unknown> };
    };
  };
}

// Maps SDK errors (and anything else runGeneration's try/catch can see) to a
// user-readable message for the job's terminal "error" event. Checked in an
// order that matters: RateLimitError/AuthenticationError/APIConnectionError
// all extend the generic APIError, so their specific branches must come
// before the generic APIError fallback or they'd never be reached.
export function mapEngineError(err: unknown): string {
  if (err instanceof Anthropic.RateLimitError) {
    return "Rate limited by the Anthropic API — try again shortly.";
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return "Anthropic credentials missing or invalid — set ANTHROPIC_API_KEY or run `ant auth login`.";
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return "Could not reach the Anthropic API — check your connection.";
  }
  if (err instanceof Anthropic.APIError) {
    return `Anthropic API error ${err.status}: ${err.message}`;
  }
  return err instanceof Error ? err.message : String(err);
}

export function createSiteTools(siteDir: string, onEvent: (ev: GenerationEvent) => void): unknown[] {
  return [
    betaZodTool({
      name: "list_files",
      description: "List every file in the site as relative paths.",
      inputSchema: z.object({}),
      run: async () => { onEvent({ type: "tool", name: "list_files" }); return (await listSiteFiles(siteDir)).join("\n"); },
    }),
    betaZodTool({
      name: "read_file",
      description: "Read one file from the site by relative path.",
      inputSchema: z.object({ path: z.string() }),
      run: async (input) => { onEvent({ type: "tool", name: "read_file", path: input.path }); return readSiteFile(siteDir, input.path); },
    }),
    betaZodTool({
      name: "write_file",
      description: "Create or overwrite one file in the site. Always write complete file contents.",
      inputSchema: z.object({ path: z.string(), content: z.string() }),
      run: async (input) => {
        await writeSiteFile(siteDir, input.path, input.content);
        onEvent({ type: "tool", name: "write_file", path: input.path });
        return `wrote ${input.path}`;
      },
    }),
  ];
}

export async function runGeneration({ client, siteDir, prompt, onEvent }: { client: EngineClient; siteDir: string; prompt: string; onEvent: (ev: GenerationEvent) => void }): Promise<void> {
  // Exactly one terminal event ("done" or "error") is emitted, and this function never throws —
  // even if the caller's onEvent itself throws while handling that terminal event (or any event
  // along the way). `terminal` guards against a double terminal emission; wrapping the emission in
  // try/catch guarantees a throwing consumer can't escape runGeneration.
  let terminal = false;
  const emitTerminal = (ev: GenerationEvent): void => {
    if (terminal) return;
    terminal = true;
    try {
      onEvent(ev);
    } catch {
      // A throwing consumer must not escape runGeneration nor trigger a second terminal event.
    }
  };

  let finalEvent: GenerationEvent;
  try {
    // `stream: true` is required, not optional: at max_tokens 64000 the SDK
    // throws client-side ("Streaming is required for operations that may
    // take longer than 10 minutes") before any request leaves the process
    // if this is omitted. See engine.test.ts's streaming regression test.
    const runner = client.beta.messages.toolRunner({
      model: "claude-opus-5",
      max_tokens: 64000,
      thinking: { type: "adaptive" },
      stream: true,
      system: buildSystemPrompt(),
      tools: createSiteTools(siteDir, onEvent),
      messages: [{ role: "user", content: prompt }],
    });
    for await (const stream of runner) {
      const message = await stream.finalMessage();
      for (const block of message.content as Array<{ type: string; text?: string }>) {
        if (block.type === "text" && block.text) onEvent({ type: "text", text: block.text });
      }
    }
    finalEvent = { type: "done" };
  } catch (err) {
    finalEvent = { type: "error", message: mapEngineError(err) };
  }
  emitTerminal(finalEvent);
}
