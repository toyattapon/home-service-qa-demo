import { Router } from 'express';
import { config } from '../../config';
import { resetDatabase } from '../../db/reset';
import { AppError } from '../../errors/AppError';

export const testRoutes = Router();

testRoutes.post('/reset', async (_request, response) => {
  if (config.nodeEnv !== 'development' && config.nodeEnv !== 'test') {
    throw new AppError(
      403,
      'RESET_DISABLED',
      'Test reset is disabled in this environment',
    );
  }
  await resetDatabase();
  response.json({
    data: null,
    message: 'Test data reset successfully',
  });
});
