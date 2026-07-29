import type {
  CreateJobInput,
  Invoice,
  Job,
  JobStatus,
  SessionUser,
  UsedPart,
} from '../../../shared/domain';
import { bangkokDate } from '../../db/reset';
import { pool } from '../../db/pool';
import { withTransaction } from '../../db/transaction';
import { canTransitionJobStatus } from '../../domain/jobStatusRules';
import { validateUsedParts } from '../../domain/inventoryRules';
import { AppError } from '../../errors/AppError';
import { findCustomerById } from '../customers/customerRepository';
import { completeJob } from '../invoices/completionService';
import {
  findJobById,
  insertJob,
  type Queryable,
} from './jobRepository';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}

async function assertTechnicianExists(
  technicianId: string,
  queryable: Queryable = pool,
): Promise<void> {
  const result = await queryable.query(
    'SELECT 1 FROM technicians WHERE id = $1 AND active = true',
    [technicianId],
  );
  if (!result.rowCount) {
    throw new AppError(404, 'NOT_FOUND', 'Technician not found');
  }
}

export async function getJobForActor(
  id: string,
  actor: SessionUser,
): Promise<Job> {
  const job = await findJobById(id);
  if (!job) {
    throw new AppError(404, 'NOT_FOUND', 'Job not found');
  }
  if (
    actor.role === 'technician' &&
    (!actor.technicianId || job.technicianId !== actor.technicianId)
  ) {
    throw new AppError(403, 'FORBIDDEN', 'You cannot access this job');
  }
  return job;
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  if (input.preferredDate < bangkokDate(0)) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Preferred date cannot be in the past',
      { preferredDate: 'Preferred date cannot be in the past' },
    );
  }
  if (!(await findCustomerById(input.customerId))) {
    throw new AppError(404, 'NOT_FOUND', 'Customer not found');
  }
  if (input.technicianId) {
    await assertTechnicianExists(input.technicianId);
  }
  try {
    return await insertJob(input);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        400,
        'TECHNICIAN_SCHEDULE_CONFLICT',
        'Technician already has a job in this time slot',
      );
    }
    throw error;
  }
}

export async function assignTechnician(
  jobId: string,
  technicianId: string,
): Promise<Job> {
  try {
    return await withTransaction(async (client) => {
      const result = await client.query<{
        status: JobStatus;
      }>('SELECT status FROM jobs WHERE id = $1 FOR UPDATE', [jobId]);
      const row = result.rows[0];
      if (!row) {
        throw new AppError(404, 'NOT_FOUND', 'Job not found');
      }
      if (row.status !== 'Pending' && row.status !== 'Assigned') {
        throw new AppError(
          400,
          'INVALID_STATUS_TRANSITION',
          'This job cannot be assigned',
        );
      }
      await assertTechnicianExists(technicianId, client);
      await client.query(
        `UPDATE jobs
         SET technician_id = $2, status = 'Assigned', updated_at = now()
         WHERE id = $1`,
        [jobId, technicianId],
      );
      return (await findJobById(jobId, client))!;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        400,
        'TECHNICIAN_SCHEDULE_CONFLICT',
        'Technician already has a job in this time slot',
      );
    }
    throw error;
  }
}

export async function replaceUsedParts(
  jobId: string,
  usedParts: UsedPart[],
  actor: SessionUser,
): Promise<Job> {
  if (actor.role !== 'technician' || !actor.technicianId) {
    throw new AppError(403, 'FORBIDDEN', 'Technician access required');
  }
  return withTransaction(async (client) => {
    const job = await findJobById(jobId, client);
    if (!job) {
      throw new AppError(404, 'NOT_FOUND', 'Job not found');
    }
    if (job.technicianId !== actor.technicianId) {
      throw new AppError(403, 'FORBIDDEN', 'You cannot access this job');
    }
    if (job.status !== 'In Progress') {
      throw new AppError(
        400,
        'INVALID_STATUS_TRANSITION',
        'Used parts can be edited only while the job is In Progress',
      );
    }
    const inventoryResult = await client.query<{
      id: string;
      name: string;
      stock: number;
      safety_stock: number;
      unit_cost: number;
    }>(
      `SELECT id, name, stock, safety_stock, unit_cost
       FROM inventory_items
       ORDER BY id`,
    );
    validateUsedParts(
      usedParts,
      inventoryResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        stock: row.stock,
        safetyStock: row.safety_stock,
        unitCost: row.unit_cost,
      })),
    );
    await client.query('DELETE FROM job_used_parts WHERE job_id = $1', [jobId]);
    for (const part of usedParts) {
      await client.query(
        `INSERT INTO job_used_parts (job_id, inventory_item_id, quantity)
         VALUES ($1, $2, $3)`,
        [jobId, part.inventoryItemId, part.quantity],
      );
    }
    return (await findJobById(jobId, client))!;
  });
}

export async function updateJobStatus(
  jobId: string,
  nextStatus: JobStatus,
  actor: SessionUser,
): Promise<{ job: Job; invoice?: Invoice }> {
  const job = await getJobForActor(jobId, actor);
  if (!canTransitionJobStatus(job.status, nextStatus)) {
    throw new AppError(
      400,
      'INVALID_STATUS_TRANSITION',
      'Invalid job status transition',
    );
  }

  const adminCancellation =
    actor.role === 'admin' && nextStatus === 'Cancelled';
  const technicianStart =
    actor.role === 'technician' && nextStatus === 'In Progress';
  const technicianComplete =
    actor.role === 'technician' && nextStatus === 'Completed';

  if (!adminCancellation && !technicianStart && !technicianComplete) {
    throw new AppError(
      403,
      'FORBIDDEN',
      'Your role cannot perform this status transition',
    );
  }

  if (technicianComplete) {
    const result = await completeJob(jobId, actor.technicianId!);
    return result;
  }

  await pool.query(
    'UPDATE jobs SET status = $2, updated_at = now() WHERE id = $1',
    [jobId, nextStatus],
  );
  return { job: (await findJobById(jobId))! };
}
