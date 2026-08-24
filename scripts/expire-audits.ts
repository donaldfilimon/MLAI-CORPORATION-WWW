import { expireConversationAudits } from "../src/lib/server/audit-store";
import { closeDatabaseForTests } from "../src/lib/server/db";

try {
  const deleted = await expireConversationAudits();
  console.log(JSON.stringify({ ok: true, deleted }));
} finally {
  await closeDatabaseForTests();
}
