import type { SessionUser } from '../../../shared/domain';
import { pool } from '../../db/pool';
import { AppError } from '../../errors/AppError';

interface LoginResult {
  token: string;
  user: SessionUser;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const result = await pool.query<{
    id: string;
    name: string;
    email: string;
    password: string;
    role: SessionUser['role'];
    technician_id: string | null;
  }>(
    `SELECT u.id, u.name, u.email, u.password, u.role, t.id AS technician_id
     FROM users u
     LEFT JOIN technicians t ON t.user_id = u.id
     WHERE lower(u.email) = lower($1)`,
    [email],
  );

  const row = result.rows[0];
  if (!row || row.password !== password) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password',
    );
  }

  return {
    token:
      row.role === 'admin'
        ? 'mock-token-admin'
        : 'mock-token-technician',
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      ...(row.technician_id ? { technicianId: row.technician_id } : {}),
    },
  };
}
