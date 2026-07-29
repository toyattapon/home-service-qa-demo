import { fileURLToPath } from 'node:url';
import { pool } from './pool';
import { resetDatabase } from './reset';

export async function seedDatabase(): Promise<void> {
  await resetDatabase();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(() => {
      console.info('Database seed completed.');
    })
    .finally(() => pool.end());
}
