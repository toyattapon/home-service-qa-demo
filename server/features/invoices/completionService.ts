import type { QueryResultRow } from 'pg';
import type {
  InventoryItem,
  Invoice,
  Job,
  UsedPart,
} from '../../../shared/domain';
import { withTransaction } from '../../db/transaction';
import { assertAvailableStock } from '../../domain/inventoryRules';
import { canTransitionJobStatus } from '../../domain/jobStatusRules';
import { calculateInvoice } from '../../domain/pricingRules';
import { AppError } from '../../errors/AppError';
import { findJobById } from '../jobs/jobRepository';
import { insertInvoice } from './invoiceRepository';

interface CompletionJobRow extends QueryResultRow {
  id: string;
  status: Job['status'];
  technician_id: string | null;
  service_type: Job['serviceType'];
  number_of_units: number;
  priority: Job['priority'];
}

interface LockedPartRow extends QueryResultRow {
  inventory_item_id: string;
  quantity: number;
  name: string;
  stock: number;
  safety_stock: number;
  unit_cost: number;
}

export async function completeJob(
  jobId: string,
  technicianId: string,
): Promise<{ job: Job; invoice: Invoice }> {
  return withTransaction(async (client) => {
    const jobResult = await client.query<CompletionJobRow>(
      `SELECT id, status, technician_id, service_type, number_of_units, priority
       FROM jobs
       WHERE id = $1
       FOR UPDATE`,
      [jobId],
    );
    const row = jobResult.rows[0];
    if (!row) {
      throw new AppError(404, 'NOT_FOUND', 'Job not found');
    }
    if (row.technician_id !== technicianId) {
      throw new AppError(403, 'FORBIDDEN', 'You cannot complete this job');
    }
    if (!canTransitionJobStatus(row.status, 'Completed')) {
      throw new AppError(
        400,
        'INVALID_STATUS_TRANSITION',
        'Invalid job status transition',
      );
    }

    const partsResult = await client.query<LockedPartRow>(
      `SELECT
         parts.inventory_item_id,
         parts.quantity,
         items.name,
         items.stock,
         items.safety_stock,
         items.unit_cost
       FROM job_used_parts parts
       JOIN inventory_items items ON items.id = parts.inventory_item_id
       WHERE parts.job_id = $1
       ORDER BY parts.inventory_item_id
       FOR UPDATE OF items`,
      [jobId],
    );

    const usedParts: UsedPart[] = partsResult.rows.map((part) => ({
      inventoryItemId: part.inventory_item_id,
      quantity: part.quantity,
    }));
    const inventoryItems: InventoryItem[] = partsResult.rows.map((part) => ({
      id: part.inventory_item_id,
      name: part.name,
      stock: part.stock,
      safetyStock: part.safety_stock,
      unitCost: part.unit_cost,
    }));
    assertAvailableStock(usedParts, inventoryItems);

    const calculation = calculateInvoice(
      {
        serviceType: row.service_type,
        numberOfUnits: row.number_of_units,
        priority: row.priority,
        usedParts,
      },
      inventoryItems,
    );

    for (const part of usedParts) {
      await client.query(
        `UPDATE inventory_items
         SET stock = stock - $2, updated_at = now()
         WHERE id = $1`,
        [part.inventoryItemId, part.quantity],
      );
    }
    await client.query(
      `UPDATE jobs SET status = 'Completed', updated_at = now() WHERE id = $1`,
      [jobId],
    );
    const invoice = await insertInvoice(client, jobId, calculation);
    const job = (await findJobById(jobId, client))!;
    return { job, invoice };
  });
}
