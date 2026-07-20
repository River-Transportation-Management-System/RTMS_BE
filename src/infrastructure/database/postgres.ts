import { Pool } from "pg";

import { env } from "@/config/env";

declare global {
  var rtmsDatabasePool: Pool | undefined;
}

export const database =
  global.rtmsDatabasePool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
  });

if (env.NODE_ENV !== "production") {
  global.rtmsDatabasePool = database;
}
