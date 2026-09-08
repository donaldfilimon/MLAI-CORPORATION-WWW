process.argv = process.argv.filter(
  (value, index) => index < 2 || value !== "--",
);
import "./env";
import { stdin, stdout } from "node:process";
import { one, run } from "../src/lib/server/db";
import { hashPassword } from "better-auth/crypto";
const mode = process.argv[2],
  email = process.argv[3];
if (!email || !["staff", "reset"].includes(mode)) {
  console.error(
    "Usage: bun run account:staff email | bun run account:reset email",
  );
  process.exit(1);
}
const user = one<{ id: string }>(
  "SELECT id FROM user WHERE email=?",
  email.toLowerCase(),
);
if (!user)
  throw new Error("Account not found. Register the local account first.");
if (mode === "staff") {
  run("INSERT OR IGNORE INTO staff(user_id) VALUES(?)", user.id);
  console.log("Staff access assigned.");
} else {
  if (!stdin.isTTY)
    throw new Error("Password reset requires an interactive terminal.");
  stdout.write("New password (at least 12 characters, hidden): ");
  const password = await new Promise<string>((resolve, reject) => {
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    function done() {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", receive);
      stdout.write("\n");
    }
    function receive(chunk: Buffer) {
      for (const ch of chunk.toString()) {
        if (ch === "\u0003") {
          done();
          reject(new Error("Reset cancelled."));
          return;
        }
        if (ch === "\r" || ch === "\n") {
          done();
          resolve(value);
          return;
        }
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else if (ch >= " ") value += ch;
      }
    }
    stdin.on("data", receive);
  });
  if (password.length < 12) throw new Error("Password is too short.");
  run(
    "UPDATE account SET password=?,updatedAt=? WHERE userId=? AND providerId='credential'",
    await hashPassword(password),
    Date.now(),
    user.id,
  );
  run("DELETE FROM session WHERE userId=?", user.id);
  console.log("Password reset and all existing sessions revoked.");
}
