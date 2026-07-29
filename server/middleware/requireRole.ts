import type { NextFunction, Response } from 'express';
import type { UserRole } from '../../shared/domain';
import { AppError } from '../errors/AppError';
import type { AuthenticatedRequest } from './authenticate';

export function requireRole(...roles: UserRole[]) {
  return (
    request: AuthenticatedRequest,
    _response: Response,
    next: NextFunction,
  ): void => {
    if (!request.authUser) {
      throw new AppError(401, 'UNAUTHENTICATED', 'Authentication required');
    }
    if (!roles.includes(request.authUser.role)) {
      throw new AppError(
        403,
        'FORBIDDEN',
        'You do not have permission to perform this action',
      );
    }
    next();
  };
}
