import { Client } from "pg";
import { Resource } from "sst";
import { handleCreate } from "./lib/create";
import { handleDestroy } from "./lib/destroy";
import { type Event, eventSchema, type Response } from "./lib/types";
import { names } from "./lib/util";

export async function handler(event: Event): Promise<Response> {
  eventSchema.parse(event);

  const { database, username } = names(event.repository, event.prNumber);
  const adminUrl = Resource.DatabaseUrl.value;

  const client = new Client({ connectionString: adminUrl });
  await client.connect();

  try {
    if (event.action === "create") {
      return await handleCreate(client, adminUrl, database, username);
    } else if (event.action === "destroy") {
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
