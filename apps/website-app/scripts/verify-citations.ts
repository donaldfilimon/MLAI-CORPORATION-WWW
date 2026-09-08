import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { fixtureAccount, fixtureApi, fixtureJson } from "./agent-verification";
import { assessCitationAnswer, citationScenarios } from "./citation-scenarios";
import { releaseSource } from "./release-source";
import { writeVerificationReceipt } from "./verification-receipt";

const endpoint = process.env.MLAI_MODEL_URL;
const model = process.env.MLAI_MODEL_ID;
assert.ok(
  endpoint && model,
  "Set MLAI_MODEL_URL and MLAI_MODEL_ID explicitly.",
);
const url = new URL(endpoint);
assert.ok(
  ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) &&
    ["http:", "https:"].includes(url.protocol) &&
    !url.username &&
    !url.password &&
    !url.search &&
    !url.hash,
  "Citation evaluation requires a credential-free loopback model URL.",
);
const modelsResponse = await fetch(`${endpoint.replace(/\/$/, "")}/models`, {
  redirect: "error",
  signal: AbortSignal.timeout(15_000),
});
assert.ok(
  modelsResponse.ok,
  `Model preflight returned ${modelsResponse.status}`,
);
const advertised = z
  .object({ data: z.array(z.object({ id: z.string() })) })
  .parse(await modelsResponse.json());
assert.ok(
  advertised.data.some((m) => m.id === model),
  "Explicitly selected model is not advertised.",
);

const source = releaseSource();
const root = mkdtempSync(join(tmpdir(), "mlai-citation-eval-"));
process.env.MLAI_DATA_DIR = root;
process.env.APP_URL = "http://127.0.0.1:3197";
process.env.MLAI_CONNECTIONS_FILE = join(root, "connections.json");
writeFileSync(
  process.env.MLAI_CONNECTIONS_FILE,
  JSON.stringify([
    {
      id: "evaluation-local",
      name: "Explicit local citation evaluation",
      kind: "local",
      url: endpoint,
      model,
    },
  ]),
  { mode: 0o600 },
);
const { run, sqlite } = await import("../src/lib/server/db");
const outcomes: Record<string, unknown>[] = [];
let infrastructureFailures = 0;
try {
  const account = await fixtureAccount("citation-eval");
  const outsider = await fixtureAccount("citation-outsider");
  run(
    "UPDATE workspaces SET provider_id=? WHERE id=?",
    "evaluation-local",
    account.workspace,
  );
  for (const scenario of citationScenarios) {
    const document = `evaluation-${scenario.id}`;
    run(
      "INSERT INTO documents(id,workspace_id,name,extension,size,status,created_at,updated_at) VALUES(?,?,?,'txt',100,'ready',1,1)",
      document,
      account.workspace,
      `${scenario.id}.txt`,
    );
    scenario.passages.forEach((content, ordinal) => {
      run(
        "INSERT INTO chunks(id,document_id,workspace_id,ordinal,content,location) VALUES(?,?,?,?,?,?)",
        `${document}-${ordinal}`,
        document,
        account.workspace,
        ordinal,
        content,
        JSON.stringify({ section: ordinal + 1 }),
      );
    });
    for (let repetition = 1; repetition <= 5; repetition++) {
      const outcome: Record<string, unknown> = {
        scenario: scenario.id,
        repetition,
        question: scenario.question,
        annotatedPassages: scenario.passages,
        supportingOrdinals: scenario.supportingOrdinals,
        allowedOrdinals: scenario.allowedOrdinals,
      };
      try {
        const conversation = z
          .object({ id: z.string() })
          .parse(await fixtureJson(account, "conversations", "POST", {}));
        const response = await fixtureApi(
          account,
          `chat/${conversation.id}`,
          "POST",
          { message: scenario.question, document_ids: [document] },
        );
        assert.ok(response.ok, `Chat returned ${response.status}`);
        const stream = await response.text();
        outcome.rawSyntheticStream = stream;
        const events = stream
          .split("\n\n")
          .filter(Boolean)
          .map((entry) => {
            const lines = entry.split("\n");
            return {
              event: lines
                .find((line) => line.startsWith("event:"))
                ?.slice(6)
                .trim(),
              data: JSON.parse(
                lines.find((line) => line.startsWith("data:"))?.slice(5) ||
                  "null",
              ) as unknown,
            };
          });
        outcome.events = events;
        outcome.providerErrors = events
          .filter((event) => event.event === "error")
          .map((event) => event.data);
        const start = z
          .object({
            sources: z.array(
              z.object({
                id: z.string(),
                documentId: z.string(),
                content: z.string(),
              }),
            ),
          })
          .parse(events.find((e) => e.event === "start")?.data);
        outcome.suppliedSources = start.sources;
        const retrievalErrors = start.sources
          .filter((item) => {
            const ordinal = Number(item.id.slice(document.length + 1));
            return (
              item.documentId !== document ||
              item.id !== `${document}-${ordinal}` ||
              item.content !== scenario.passages[ordinal]
            );
          })
          .map((item) => item.id);
        for (const ordinal of scenario.supportingOrdinals) {
          if (
            !start.sources.some((item) => item.id === `${document}-${ordinal}`)
          )
            retrievalErrors.push(`missing-support:${ordinal}`);
        }
        outcome.retrievalErrors = retrievalErrors;
        if (retrievalErrors.length) infrastructureFailures++;
        const done = z
          .object({
            content: z.string(),
            citations: z.array(
              z.object({
                number: z.number(),
                id: z.string(),
                documentId: z.string(),
              }),
            ),
          })
          .parse(events.find((e) => e.event === "done")?.data);
        outcome.answer = done.content;
        outcome.suppliedSources = start.sources;
        outcome.citations = done.citations;
        const mappingErrors: string[] = [];
        const authorizationErrors: string[] = [];
        for (const citation of done.citations) {
          const supplied = start.sources[citation.number - 1];
          if (
            !supplied ||
            supplied.id !== citation.id ||
            supplied.documentId !== citation.documentId
          )
            mappingErrors.push(citation.id);
          const owner = await fixtureApi(
            account,
            `documents/${citation.documentId}/source?chunk=${encodeURIComponent(citation.id)}`,
          );
          const other = await fixtureApi(
            outsider,
            `documents/${citation.documentId}/source?chunk=${encodeURIComponent(citation.id)}`,
          );
          if (!owner.ok || other.status !== 404)
            authorizationErrors.push(citation.id);
          if (owner.ok) {
            const inspected = z
              .object({
                id: z.string(),
                content: z.string(),
                location: z.object({ section: z.number() }),
              })
              .parse(await owner.json());
            const ordinal = Number(citation.id.slice(document.length + 1));
            if (
              inspected.id !== citation.id ||
              inspected.content !== scenario.passages[ordinal] ||
              inspected.location.section !== ordinal + 1 ||
              supplied?.content !== inspected.content
            )
              mappingErrors.push(`excerpt:${citation.id}`);
          }
        }
        // Test authorization even when the model abstains or omits all citations.
        const otherDocument = await fixtureApi(
          outsider,
          `documents/${document}`,
        );
        if (otherDocument.status !== 404) authorizationErrors.push(document);
        outcome.applicationMappingErrors = mappingErrors;
        outcome.authorizationErrors = authorizationErrors;
        if (mappingErrors.length || authorizationErrors.length)
          infrastructureFailures++;
        outcome.modelAssessment =
          retrievalErrors.length ||
          mappingErrors.length ||
          authorizationErrors.length
            ? {
                applicable: false,
                reason: "Evidence retrieval, mapping or authorization failed",
              }
            : assessCitationAnswer(
                scenario,
                done.content,
                done.citations.map((c) =>
                  Number(c.id.slice(document.length + 1)),
                ),
              );
        outcome.unsupportedCitationMarkers = done.content.includes(
          "[unsupported citation]",
        );
      } catch (error) {
        infrastructureFailures++;
        outcome.executionError =
          error instanceof Error ? error.message : String(error);
      }
      outcomes.push(outcome);
      console.log(`${scenario.id} ${repetition}/5 recorded`);
    }
  }
  const stable =
    releaseSource().runtimeSourceSha256 === source.runtimeSourceSha256;
  const path = writeVerificationReceipt(
    `docs/verification/citations-${Date.now()}.json`,
    {
      checkedAt: new Date().toISOString(),
      source,
      model,
      endpoint,
      syntheticOnly: true,
      scope:
        "Actual authenticated chat with seeded synthetic chunks; parser extraction is tested separately. Rubric checks annotations, not general semantic correctness.",
      repetitionsPerScenario: 5,
      outcomes,
      infrastructureFailures,
      stableRuntimeSource: stable,
      modelQualityIsSeparateFromApplicationSafety: true,
    },
  );
  console.log(`Receipt: ${path}`);
  assert.ok(
    stable,
    "Runtime source changed during evaluation; receipt is diagnostic only.",
  );
  assert.equal(
    infrastructureFailures,
    0,
    "Evaluation contains execution, mapping or authorization failures; inspect retained receipt.",
  );
} finally {
  sqlite.close();
  rmSync(root, { recursive: true, force: true });
}
