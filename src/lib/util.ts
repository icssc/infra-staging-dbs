import { randomBytes } from "node:crypto";
import type { Client } from "pg";

export const DB_PORT = 5432;

function sanitize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
}

export function names(repository: string, prNumber: number) {
  const base = `${sanitize(repository)}_staging_${prNumber}`;
  return {
    database: base.slice(0, 63),
    username: `${base}_user`.slice(0, 63),
  };
}

export function generatePassword() {
  return randomBytes(24).toString("base64url");
}

export async function databaseExists(
  client: Client,
  database: string,
): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists`,
    [database],
  );
  return result.rows[0]?.exists === true;
}

export async function roleExists(
  client: Client,
  role: string,
): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname = $1) AS exists`,
    [role],
  );
  return result.rows[0]?.exists === true;
}

export function buildPostgresUrl(input: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}): string {
  const username = encodeURIComponent(input.username);
  const password = encodeURIComponent(input.password);
  const host = input.host;
  const port = input.port;
  const database = encodeURIComponent(input.database);

  const url = new URL(
    `postgresql://${username}:${password}@${host}:${port}/${database}`,
  );

  return url.toString();
}
