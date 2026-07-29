import type { NextFunction, Request, Response } from 'express';
import type { SessionUser } from '../../shared/domain';
import { pool } from '../db/pool';
import { AppError } from '../errors/AppError';

export interface AuthenticatedRequest extends Request {
  authUser?: SessionUser;
}

const tokenEmails = new Map([
  ['mock-token-admin', 'admin@demo.com'],
  ['mock-token-technician', 'tech@demo.com'],
]);

export async function authenticate(
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = request.header('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : undefined;
  const email = token ? tokenEmails.get(token) : undefined;

  if (!email) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Authentication required');
  }

  const result = await pool.query<{
    id: string;
    name: string;
    email: string;
    role: SessionUser['role'];
    technician_id: string | null;
  }>(
    `SELECT u.id, u.name, u.email, u.role, t.id AS technician_id
     FROM users u
     LEFT JOIN technicians t ON t.user_id = u.id
     WHERE lower(u.email) = lower($1)`,
    [email],
  );

  const row = result.rows[0];
  if (!row) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Authentication required');
  }

  request.authUser = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    ...(row.technician_id ? { technicianId: row.technician_id } : {}),
  };
  next();
}
