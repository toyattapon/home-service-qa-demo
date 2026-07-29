import { Router } from 'express';
import { pool } from '../../db/pool';

export const healthRoutes = Router();

healthRoutes.get('/', async (_request, response) => {
  await pool.query('SELECT 1');
  response.json({
    data: {
      status: 'ok',
      database: 'connected',
    },
  });
});
