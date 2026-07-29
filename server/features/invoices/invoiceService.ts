import type { QueryResultRow } from 'pg';
import type {
  InventoryItem,
  Invoice,
  Job,
  UsedPart,
} from '../../../shared/domain';
import { withTransaction } from '../../db/transaction';
import { calculateInvoice } from '../../domain/pricingRules';
import { AppError } from '../../errors/AppError';
import { findJobById } from '../jobs/jobRepository';
import {
  findInvoiceById,
  findInvoiceByJobId,
  insertInvoice,
} from './invoiceRepository';

interface InvoicePartRow extends QueryResultRow {
  inventory_item_id: string;
  quantity: number;
  name: string;
  stock: number;
  safety_stock: number;
  unit_cost: number;
}

export async function getInvoice(id: string): Promise<Invoice> {
  const invoice = await findInvoiceById(id);
  if (!invoice) {
    throw new AppError(404, 'NOT_FOUND', 'Invoice not found');
  }
  return invoice;
}

export async function generateInvoice(
  jobId: string,
): Promise<{ invoice: Invoice; created: boolean }> {
  return withTransaction(async (client) => {
    const job = await findJobById(jobId, client);
    if (!job) {
      throw new AppError(404, 'NOT_FOUND', 'Job not found');
    }
    const existing = await findInvoiceByJobId(jobId, client);
    if (existing) {
      return { invoice: existing, created: false };
    }
    if (job.status !== 'Completed') {
      throw new AppError(
        400,
        'JOB_NOT_COMPLETED',
        'Job is not completed',
      );
    }

    const partResult = await client.query<InvoicePartRow>(
      `SELECT
         parts.inventory_item_id,
         parts.quantity,
         items.name,
         items.stock,
         items.safety_stock,
         items.unit_cost
       FROM job_used_parts parts
       JOIN inventory_items items ON items.id = parts.inventory_item_id
       WHERE parts.job_id = $1`,
      [jobId],
    );
    const usedParts: UsedPart[] = partResult.rows.map((row) => ({
      inventoryItemId: row.inventory_item_id,
      quantity: row.quantity,
    }));
    const inventory: InventoryItem[] = partResult.rows.map((row) => ({
      id: row.inventory_item_id,
      name: row.name,
      stock: row.stock,
      safetyStock: row.safety_stock,
      unitCost: row.unit_cost,
    }));
    const calculation = calculateInvoice(
      {
        serviceType: job.serviceType,
        numberOfUnits: job.numberOfUnits,
        priority: job.priority,
        usedParts,
      } satisfies Pick<
        Job,
        'serviceType' | 'numberOfUnits' | 'priority' | 'usedParts'
      >,
      inventory,
    );
    return {
      invoice: await insertInvoice(client, jobId, calculation),
      created: true,
    };
  });
}

export async function payInvoice(id: string): Promise<Invoice> {
  return withTransaction(async (client) => {
    const result = await client.query<{ status: Invoice['status'] }>(
      'SELECT status FROM invoices WHERE id = $1 FOR UPDATE',
      [id],
    );
    const row = result.rows[0];
    if (!row) {
      throw new AppError(404, 'NOT_FOUND', 'Invoice not found');
    }
    if (row.status === 'Paid') {
      throw new AppError(
        400,
        'INVOICE_ALREADY_PAID',
        'Invoice is already paid',
      );
    }
    await client.query(
      `UPDATE invoices
       SET status = 'Paid',
           paid_at = now(),
           receipt_no =
             'RCP-' ||
             to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok', 'YYYYMMDD') ||
             '-' ||
             lpad(nextval('receipt_number_seq')::text, 4, '0')
       WHERE id = $1`,
      [id],
    );
    return (await findInvoiceById(id, client))!;
  });
}
