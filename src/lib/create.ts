import type { Client } from "pg";
import { parse } from "pg-connection-string";
import format from "pg-format";
import type { CreateResponse } from "./types";
import {
  buildPostgresUrl,
  databaseExists,
  generatePassword,
  roleExists,
} from "./util";

export async function handleCreate(
  client: Client,
  adminUrl: string,
  database: string,
  username: string,
): Promise<CreateResponse> {
  const existingDb = await databaseExists(client, database);
  const existingUser = await roleExists(client, username);

  const password = generatePassword();

  if (!existingUser) {
    await client.query(
      format("CREATE ROLE %I LOGIN PASSWORD %L", username, password),
    );
  } else {
    await client.query(
      format("ALTER ROLE %I WITH LOGIN PASSWORD %L", username, password),
    );
  }

  if (!existingDb) {
    await client.query(
      format("CREATE DATABASE %I OWNER %I", database, username),
    );
  } else {
    await client.query(
      format("ALTER DATABASE %I OWNER TO %I", database, username),
    );
  }

  await client.query(format("REVOKE ALL ON DATABASE %I FROM PUBLIC", database));
  await client.query(
    format("GRANT ALL PRIVILEGES ON DATABASE %I TO %I", database, username),
  );

  const parsed = parse(adminUrl);

  const url = buildPostgresUrl({
    host: parsed.host || "localhost",
    port: parsed.port ? Number(parsed.port) : 5432,
    database,
    username,
    password,
  });

  return {
    ok: true,
    action: "create",
    url,
  };
}
