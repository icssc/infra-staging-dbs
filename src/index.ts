import { Client } from "pg";
import { Resource } from "sst";
import { handleCreate } from "./lib/create";
import { handleDestroy } from "./lib/destroy";
import { Action, type Event, eventSchema, type Response } from "./lib/types";
import { DB_PORT, names } from "./lib/util";

export async function handler(event: Event): Promise<Response> {
  try {
    eventSchema.parse(event);
  } catch {
    return {
      ok: false,
      error: "Invalid event",
    };
  }

  const { database, username } = names(event.repository, event.prNumber);
  const host = Resource.DatabaseHost.value;
  const password = Resource.DatabasePassword.value;

  const client = new Client({
    host,
    port: DB_PORT,
    user: "postgres",
    password,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    if (event.action === Action.Deploy) {
      return await handleCreate(client, host, database, username);
    } else if (event.action === Action.Remove) {
      return await handleDestroy(client, database, username);
    }
    return {
      ok: false,
      error: "Unknown action",
    };
  } finally {
    await client.end();
  }
}
