// Invoked only by verify-integrations, in a separate process against a restored installation.
import assert from "node:assert/strict";
const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
const input = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
  cookie: string;
  workspace: string;
  document: string;
  conversation: string;
};
const { dispatch } = await import("../src/lib/server/api");
async function req(path: string, method = "GET", body?: unknown) {
  return dispatch(
    new Request(`${process.env.APP_URL}/api/v1/${path}`, {
      method,
      headers: {
        Cookie: input.cookie,
        Origin: process.env.APP_URL!,
        "X-Workspace-ID": input.workspace,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    path.split("?")[0].split("/"),
  );
}
async function api(path: string, method = "GET", body?: unknown) {
  const r = await req(path, method, body);
  assert.ok(r.ok);
  return r.json();
}
const doc = await api(`documents/${input.document}`);
assert.ok(doc.extraction.text.includes("Friday"));
assert.ok((await req(`documents/${input.document}/download`)).ok);
const project = await api("projects", "POST", { name: "Restored project" });
assert.ok(project.id);
const engagement = await api("engagements", "POST", {
  title: "Restored service request",
  description: "Confirm recovery of customer operations.",
});
await api(`engagements/${engagement.id}/comments`, "POST", {
  content: "Restored customer workflow works.",
});
assert.equal((await api(`engagements/${engagement.id}`)).comments.length, 1);
const conversation = await api("conversations", "POST", {});
const response = await req(`chat/${conversation.id}`, "POST", {
  message: "What is the review deadline? Cite the supplied source.",
  document_ids: [input.document],
});
const events = await response.text();
assert.ok(events.includes("event: done"));
const answer = (await api(`conversations/${conversation.id}`)).messages.at(-1);
assert.match(answer.content, /Friday/i);
assert.ok(answer.citations.length);
console.log(
  "PASS restored account, source download, customer workflow and grounded local chat",
);
