import { type Client, escapeIdentifier } from "pg";
import { Action, type DestroyResponse } from "./types";
import { databaseExists, roleExists } from "./util";

export async function handleDestroy(
  client: Client,
  database: string,
  username: string,
): Promise<DestroyResponse> {
  if (await databaseExists(client, database)) {
    await client.query(
      `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1
        AND pid <> pg_backend_pid()
      `,
      [database],
    );

    await client.query(`DROP DATABASE ${escapeIdentifier(database)}`);
  }

  if (await roleExists(client, username)) {
    await client.query(`DROP ROLE ${escapeIdentifier(username)}`);
  }

  return {
    ok: true,
    action: Action.Remove,
    database,
    username,
  };
}
