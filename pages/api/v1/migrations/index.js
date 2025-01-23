import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { createRouter } from "next-connect";
import { onErrorHandler, onNoMatchHandler } from "infra/middlewares";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

const getDefaultMigrationOptions = (dbClient) => ({
  dbClient,
  databaseUrl: process.env.DATABASE_URL,
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
});

async function getHandler(request, response) {
  const dbClient = await database.getNewClient();
  const pendingMigrations = await migrationRunner(
    getDefaultMigrationOptions(dbClient),
  );
  await dbClient.end();
  response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const dbClient = await database.getNewClient();
  const migratedMigrations = await migrationRunner({
    ...getDefaultMigrationOptions(),
    dryRun: false,
  });

  await dbClient.end();

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  response.status(200).json(migratedMigrations);
}

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});
