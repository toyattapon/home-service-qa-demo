import { Router } from 'express';
import type { QueryResultRow } from 'pg';
import type { DashboardSummary } from '../../../shared/domain';
import { pool } from '../../db/pool';

interface DashboardRow extends QueryResultRow {
  total_jobs_today: number;
  pending_jobs: number;
  assigned_jobs: number;
  completed_jobs: number;
  unpaid_invoices: number;
  low_stock_items: number;
}

export const dashboardRoutes = Router();

dashboardRoutes.get('/summary', async (_request, response) => {
  const result = await pool.query<DashboardRow>(`
    SELECT
      (SELECT count(*) FROM jobs
       WHERE preferred_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date)
        AS total_jobs_today,
      (SELECT count(*) FROM jobs WHERE status = 'Pending') AS pending_jobs,
      (SELECT count(*) FROM jobs WHERE status = 'Assigned') AS assigned_jobs,
      (SELECT count(*) FROM jobs WHERE status = 'Completed') AS completed_jobs,
      (SELECT count(*) FROM invoices WHERE status = 'Unpaid') AS unpaid_invoices,
      (SELECT count(*) FROM inventory_items WHERE stock <= safety_stock)
        AS low_stock_items
  `);
  const row = result.rows[0];
  const data: DashboardSummary = {
    totalJobsToday: row.total_jobs_today,
    pendingJobs: row.pending_jobs,
    assignedJobs: row.assigned_jobs,
    completedJobs: row.completed_jobs,
    unpaidInvoices: row.unpaid_invoices,
    lowStockItems: row.low_stock_items,
  };
  response.json({ data });
});
