import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { SessionUser } from '../../shared/domain';
import { pool } from '../db/pool';
import { resetDatabase } from '../db/reset';
import { completeJob } from '../features/invoices/completionService';
import {
  replaceUsedParts,
  updateJobStatus,
} from '../features/jobs/jobService';

const technician: SessionUser = {
  id: 'user-tech-001',
  name: 'Demo Technician',
  email: 'tech@demo.com',
  role: 'technician',
  technicianId: 'tech-001',
};

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForBlockedQuery(fragment: string): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const result = await pool.query(
      `SELECT 1
       FROM pg_stat_activity
       WHERE pid <> pg_backend_pid()
         AND wait_event_type = 'Lock'
         AND query ILIKE $1
       LIMIT 1`,
      [`%${fragment}%`],
    );
    if (result.rowCount) return;
    await delay(10);
  }
  throw new Error(`Timed out waiting for blocked query containing ${fragment}`);
}

describe('job workflow concurrency', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('serializes used-parts replacement against completion', async () => {
    await pool.query(
      `INSERT INTO job_used_parts (job_id, inventory_item_id, quantity)
       VALUES ('job-003', 'inv-001', 1)`,
    );
    const blocker = await pool.connect();
    await blocker.query('BEGIN');
    await blocker.query(
      `SELECT id FROM inventory_items WHERE id = 'inv-001' FOR UPDATE`,
    );

    const completion = completeJob('job-003', 'tech-001');
    await waitForBlockedQuery('inventory_items');

    let replacementSettled = false;
    const replacement = replaceUsedParts(
      'job-003',
      [{ inventoryItemId: 'inv-004', quantity: 1 }],
      technician,
    ).finally(() => {
      replacementSettled = true;
    });

    await delay(100);
    const settledBeforeCompletion = replacementSettled;
    await blocker.query('COMMIT');
    blocker.release();

    const [completionResult, replacementResult] = await Promise.allSettled([
      completion,
      replacement,
    ]);

    expect(settledBeforeCompletion).toBe(false);
    expect(completionResult.status).toBe('fulfilled');
    expect(replacementResult).toMatchObject({
      status: 'rejected',
      reason: { code: 'INVALID_STATUS_TRANSITION' },
    });

    const state = await pool.query<{
      status: string;
      air_filter_stock: number;
      spray_stock: number;
      parts: unknown;
      parts_cost: number;
    }>(
      `SELECT
         (SELECT status FROM jobs WHERE id = 'job-003') AS status,
         (SELECT stock FROM inventory_items WHERE id = 'inv-001')
           AS air_filter_stock,
         (SELECT stock FROM inventory_items WHERE id = 'inv-004')
           AS spray_stock,
         (SELECT jsonb_agg(
            jsonb_build_object(
              'inventoryItemId', inventory_item_id,
              'quantity', quantity
            )
            ORDER BY inventory_item_id
          )
          FROM job_used_parts
          WHERE job_id = 'job-003') AS parts,
         (SELECT parts_cost FROM invoices WHERE job_id = 'job-003')
           AS parts_cost`,
    );
    expect(state.rows[0]).toEqual({
      status: 'Completed',
      air_filter_stock: 9,
      spray_stock: 8,
      parts: [{ inventoryItemId: 'inv-001', quantity: 1 }],
      parts_cost: 150,
    });
  });

  it('does not start a job that was cancelled while the request waited', async () => {
    const blocker = await pool.connect();
    await blocker.query('BEGIN');
    await blocker.query(`SELECT id FROM jobs WHERE id = 'job-002' FOR UPDATE`);

    const starting = updateJobStatus('job-002', 'In Progress', technician);
    await waitForBlockedQuery('jobs');

    await blocker.query(
      `UPDATE jobs SET status = 'Cancelled' WHERE id = 'job-002'`,
    );
    await blocker.query('COMMIT');
    blocker.release();

    await expect(starting).rejects.toMatchObject({
      code: 'INVALID_STATUS_TRANSITION',
    });
    const result = await pool.query<{ status: string }>(
      `SELECT status FROM jobs WHERE id = 'job-002'`,
    );
    expect(result.rows[0].status).toBe('Cancelled');
  });
});
