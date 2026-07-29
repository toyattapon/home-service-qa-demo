import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import type { ApiFailure } from '../../shared/api';
import { DomainRuleError } from '../domain/DomainRuleError';
import { config } from '../config';
import { AppError } from '../errors/AppError';

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(
    new AppError(
      404,
      'NOT_FOUND',
      `Route ${request.method} ${request.path} not found`,
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof DomainRuleError) {
    appError = new AppError(400, error.code, error.message);
  } else if (error instanceof ZodError) {
    const fieldErrors = Object.fromEntries(
      error.issues.map((issue) => [
        issue.path.join('.') || 'request',
        issue.message,
      ]),
    );
    appError = new AppError(
      400,
      'VALIDATION_ERROR',
      'Request validation failed',
      fieldErrors,
    );
  } else {
    if (config.nodeEnv === 'development') {
      console.error(error);
    }
    appError = new AppError(
      500,
      'INTERNAL_ERROR',
      'An unexpected error occurred',
    );
  }

  const body: ApiFailure = {
    message: appError.message,
    code: appError.code,
    ...(appError.fieldErrors
      ? { fieldErrors: appError.fieldErrors }
      : {}),
  };
  response.status(appError.status).json(body);
};
