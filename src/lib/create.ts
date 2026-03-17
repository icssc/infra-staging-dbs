import { type Client, escapeIdentifier, escapeLiteral } from "pg";
import { Action, type CreateResponse } from "./types";
import {
  buildPostgresUrl,
  DB_PORT,
  databaseExists,
  generatePassword,
  roleExists,
} from "./util";

export async function handleCreate(
  client: Client,
  host: string,
  database: string,
  username: string,
): Promise<CreateResponse> {
  const existingDb = await databaseExists(client, database);
  const existingUser = await roleExists(client, username);

  const password = generatePassword();

  if (!existingUser) {
    await client.query(
      `
      CREATE ROLE ${escapeIdentifier(username)} 
      LOGIN PASSWORD ${escapeLiteral(password)}
      `,
    );
  } else {
    await client.query(
      `
      ALTER ROLE ${escapeIdentifier(username)} 
      WITH LOGIN PASSWORD ${escapeLiteral(password)}
      `,
    );
  }

  if (!existingDb) {
    await client.query(
      `
      CREATE DATABASE ${escapeIdentifier(database)} 
      OWNER ${escapeIdentifier(username)}
      `,
    );
  } else {
    await client.query(
      `
      ALTER DATABASE ${escapeIdentifier(database)} 
      OWNER TO ${escapeIdentifier(username)}
      `,
    );
  }

  await client.query(
    `REVOKE ALL ON DATABASE ${escapeIdentifier(database)} FROM PUBLIC`,
  );
  await client.query(
    `
    GRANT ALL PRIVILEGES ON DATABASE ${escapeIdentifier(database)} 
    TO ${escapeIdentifier(username)}
    `,
  );

  const url = buildPostgresUrl({
    host,
    port: DB_PORT,
    username,
    password,
    database,
  });

  return {
    ok: true,
    action: Action.Deploy,
    url,
    host,
    username,
    password,
    database,
  };
}
