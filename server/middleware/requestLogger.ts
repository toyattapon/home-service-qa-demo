import type { RequestHandler } from 'express';
import { config } from '../config';

export const requestLogger: RequestHandler = (request, response, next) => {
  if (config.nodeEnv === 'production') {
    next();
    return;
  }

  const startedAt = performance.now();
  response.on('finish', () => {
    const duration = Math.round(performance.now() - startedAt);
    console.info(
      `${request.method} ${request.originalUrl} ${response.statusCode} ${duration}ms`,
    );
  });
  next();
};
