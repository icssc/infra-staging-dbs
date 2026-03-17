# Staging Database Shared Infrastructure

This repository deploys a handler for provisioning and removing staging databases.


## Usage
Usage of this handler should follow the flow of:

On update PR, if `sst stage == staging_xxx`, then `invoke handler` with `action: deploy`, which returns a `DB_URL` that can be used in the app.

On close PR, if `sst stage == staging_xxx`, then `invoke handler` with `action: remove` to remove the database.

### Deploy

The handler deploys a new database within an existing RDS instance, and returns the connection details.

Handler event body:
```json
{
  "action": "deploy",
  "repository": "antalmanac",
  "prNumber": 67
}
```

Handler response:
```json
{
  "ok": true,
  "action": "deploy",
  "url": "postgresql://antalmanac_staging_67_user:<password>@<host>:5432/antalmanac_staging_67",
  "host": "<host>",
  "username": "antalmanac_staging_67_user",
  "password": "<password>",
  "database": "antalmanac_staging_67"
}
```

### Remove

The handler removes the database that was provisioned for the staging environment.

Handler event body:
```json
{
  "action": "remove",
  "repository": "antalmanac",
  "prNumber": 67
}
```

Handler response:
```json
{
  "ok": true,
  "action": "remove",
  "database": "antalmanac_staging_67"
}
```