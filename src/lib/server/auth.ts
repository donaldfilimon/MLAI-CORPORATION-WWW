import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, run, sqlite } from "./db";
import * as schema from "./schema";
import { appUrl, authSecret } from "./config";
import { randomUUID } from "node:crypto";
export const auth = betterAuth({
  appName: "MLAI",
  baseURL: appUrl,
  secret: authSecret,
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 12,
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  trustedOrigins: [appUrl],
  rateLimit: { enabled: true, window: 60, max: 30 },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          sqlite.transaction(() => {
            const id = randomUUID();
            run(
              "INSERT INTO workspaces(id,name,created_at) VALUES(?,?,?)",
              id,
              "Personal workspace",
              Date.now(),
            );
            run(
              "INSERT INTO memberships(workspace_id,user_id,role) VALUES(?,?,'owner')",
              id,
              user.id,
            );
          })();
        },
      },
    },
  },
});
