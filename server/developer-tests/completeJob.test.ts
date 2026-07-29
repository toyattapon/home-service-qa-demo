import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { pool } from '../db/pool';
import { resetDatabase } from '../db/reset';
import { completeJob } from '../features/invoices/completionService';

describe('complete job transaction', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('completes a job, deducts each part once, and creates one invoice', async () => {
    await pool.query(
      `INSERT INTO job_used_parts (job_id, inventory_item_id, quantity)
       VALUES ('job-003', 'inv-001', 2)`,
    );

    const result = await completeJob('job-003', 'tech-001');

    expect(result.job.status).toBe('Completed');
    expect(result.invoice).toMatchObject({
      jobId: 'job-003',
      status: 'Unpaid',
      serviceFee: 300,
      urgentSurcharge: 300,
      partsCost: 300,
      subtotal: 900,
      vat: 63,
      total: 963,
    });

    const stock = await pool.query<{ stock: number }>(
      `SELECT stock FROM inventory_items WHERE id = 'inv-001'`,
    );
    expect(stock.rows[0].stock).toBe(8);

    await expect(completeJob('job-003', 'tech-001')).rejects.toMatchObject({
      code: 'INVALID_STATUS_TRANSITION',
    });

    const unchanged = await pool.query<{ stock: number; invoices: number }>(
      `SELECT
         (SELECT stock FROM inventory_items WHERE id = 'inv-001') AS stock,
         (SELECT count(*) FROM invoices WHERE job_id = 'job-003') AS invoices`,
    );
    expect(unchanged.rows[0]).toEqual({ stock: 8, invoices: 1 });
  });

  it('rolls back job, stock, and invoice when stock is insufficient', async () => {
    await pool.query(
      `UPDATE inventory_items SET stock = 0 WHERE id = 'inv-003'`,
    );
    await pool.query(
      `INSERT INTO job_used_parts (job_id, inventory_item_id, quantity)
       VALUES ('job-003', 'inv-003', 1)`,
    );

    await expect(completeJob('job-003', 'tech-001')).rejects.toMatchObject({
      code: 'INSUFFICIENT_STOCK',
    });

    const state = await pool.query<{
      status: string;
      stock: number;
      invoices: number;
    }>(
      `SELECT
         (SELECT status FROM jobs WHERE id = 'job-003') AS status,
         (SELECT stock FROM inventory_items WHERE id = 'inv-003') AS stock,
         (SELECT count(*) FROM invoices WHERE job_id = 'job-003') AS invoices`,
    );
    expect(state.rows[0]).toEqual({
      status: 'In Progress',
      stock: 0,
      invoices: 0,
    });
  });
});
