import pg from 'pg';
import { config } from '../config';

const { Pool, types } = pg;

types.setTypeParser(types.builtins.NUMERIC, Number);
types.setTypeParser(types.builtins.INT8, Number);

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  application_name: 'home-service-qa-demo',
});
