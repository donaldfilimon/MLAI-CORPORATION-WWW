// Fresh process, isolated restored data; fixture credentials arrive through stdin.
import assert from "node:assert/strict";
import { z } from "zod";
import {
  fixtureApi,
  fixtureJson,
  runDetail,
  startFixtureWorker,
  stopFixtureWorker,
  waitRun,
  type FixtureAccount,
} from "./agent-verification";
const buffers: Buffer[] = [];
for await (const chunk of process.stdin) buffers.push(Buffer.from(chunk));
const accountSchema = z.object({
  cookie: z.string(),
  workspace: z.string(),
  userId: z.string(),
});
const input = z
  .object({
    requester: accountSchema,
    peer: accountSchema,
    runId: z.string(),
    actionId: z.string(),
    projectName: z.string(),
    documentId: z.string(),
  })
  .parse(JSON.parse(Buffer.concat(buffers).toString("utf8")));
const requester: FixtureAccount = input.requester;
const { one, sqlite } = await import("../src/lib/server/db");
const before = await runDetail(requester, input.runId);
assert.equal(before.status, "awaiting_approval");
assert.equal(
  before.actions.find((a) => a.id === input.actionId)?.status,
  "pending",
);
assert.equal(
  (
    await fixtureApi(
      { ...input.peer, workspace: requester.workspace },
      `agent/actions/${input.actionId}/confirm`,
      "POST",
      {},
    )
  ).status,
  403,
);
assert.equal(
  one<{ n: number }>(
    "SELECT count(*) n FROM projects WHERE workspace_id=? AND name=?",
    requester.workspace,
    input.projectName,
  )!.n,
  0,
);
const worker = startFixtureWorker();
try {
  await fixtureJson(
    requester,
    `agent/actions/${input.actionId}/confirm`,
    "POST",
    {},
  );
  await fixtureJson(
    requester,
    `agent/actions/${input.actionId}/confirm`,
    "POST",
    {},
  );
  await waitRun(requester, input.runId, "completed");
  await fixtureJson(
    requester,
    `agent/actions/${input.actionId}/confirm`,
    "POST",
    {},
  );
  assert.equal(
    one<{ n: number }>(
      "SELECT count(*) n FROM projects WHERE workspace_id=? AND name=?",
      requester.workspace,
      input.projectName,
    )!.n,
    1,
  );
  assert.equal(
    (await fixtureApi(requester, `documents/${input.documentId}/download`))
      .status,
    200,
  );
  const request = z
    .object({ id: z.string() })
    .parse(
      await fixtureJson(requester, "engagements", "POST", {
        title: "Restored agent verification",
        description:
          "Verify customer operations remain available after restoring pending agent work.",
      }),
    );
  await fixtureJson(requester, `engagements/${request.id}/comments`, "POST", {
    content: "Restored review confirmed.",
  });
  const engagement = z
    .object({ comments: z.array(z.unknown()) })
    .parse(await fixtureJson(requester, `engagements/${request.id}`));
  assert.equal(engagement.comments.length, 1);
  console.log(
    "PASS restored pending proposal, requester authority, exactly-once action, source download and customer workflow",
  );
} finally {
  await stopFixtureWorker(worker);
  sqlite.close();
}
