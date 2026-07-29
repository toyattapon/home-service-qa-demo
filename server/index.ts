import { app } from './app';
import { config } from './config';
import { migrateDatabase } from './db/migrate';
import { pool } from './db/pool';

await migrateDatabase();

const server = app.listen(config.port, () => {
  console.info(`API listening on http://localhost:${config.port}`);
});

async function shutdown(signal: string): Promise<void> {
  console.info(`${signal} received, shutting down.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
