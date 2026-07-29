import { randomUUID } from 'node:crypto';
import type { PoolClient, QueryResultRow } from 'pg';
import type {
  Invoice,
  InvoiceCalculation,
  InvoiceStatus,
} from '../../../shared/domain';
import { pool } from '../../db/pool';
import type { Queryable } from '../jobs/jobRepository';

interface InvoiceRow extends QueryResultRow {
  id: string;
  job_id: string;
  service_fee: number;
  urgent_surcharge: number;
  parts_cost: number;
  subtotal: number;
  vat: number;
  total: number;
  status: InvoiceStatus;
  receipt_no: string | null;
  created_at: Date;
  paid_at: Date | null;
  customer_name: string | null;
  service_type: Invoice['serviceType'] | null;
}

const invoiceSelect = `
  SELECT
    inv.id,
    inv.job_id,
    inv.service_fee,
    inv.urgent_surcharge,
    inv.parts_cost,
    inv.subtotal,
    inv.vat,
    inv.total,
    inv.status,
    inv.receipt_no,
    inv.created_at,
    inv.paid_at,
    c.name AS customer_name,
    j.service_type
  FROM invoices inv
  JOIN jobs j ON j.id = inv.job_id
  JOIN customers c ON c.id = j.customer_id
`;

function mapInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    jobId: row.job_id,
    serviceFee: row.service_fee,
    urgentSurcharge: row.urgent_surcharge,
    partsCost: row.parts_cost,
    subtotal: row.subtotal,
    vat: row.vat,
    total: row.total,
    status: row.status,
    ...(row.receipt_no ? { receiptNo: row.receipt_no } : {}),
    createdAt: row.created_at.toISOString(),
    ...(row.paid_at ? { paidAt: row.paid_at.toISOString() } : {}),
    ...(row.customer_name ? { customerName: row.customer_name } : {}),
    ...(row.service_type ? { serviceType: row.service_type } : {}),
  };
}

export async function listInvoices(
  status?: InvoiceStatus,
): Promise<Invoice[]> {
  const result = await pool.query<InvoiceRow>(
    `${invoiceSelect}
     WHERE $1::text IS NULL OR inv.status = $1
     ORDER BY inv.created_at DESC, inv.id`,
    [status ?? null],
  );
  return result.rows.map(mapInvoice);
}

export async function findInvoiceById(
  id: string,
  queryable: Queryable = pool,
): Promise<Invoice | undefined> {
  const result = await queryable.query<InvoiceRow>(
    `${invoiceSelect} WHERE inv.id = $1`,
    [id],
  );
  return result.rows[0] ? mapInvoice(result.rows[0]) : undefined;
}

export async function findInvoiceByJobId(
  jobId: string,
  queryable: Queryable = pool,
): Promise<Invoice | undefined> {
  const result = await queryable.query<InvoiceRow>(
    `${invoiceSelect} WHERE inv.job_id = $1`,
    [jobId],
  );
  return result.rows[0] ? mapInvoice(result.rows[0]) : undefined;
}

export async function insertInvoice(
  client: PoolClient,
  jobId: string,
  calculation: InvoiceCalculation,
): Promise<Invoice> {
  const id = `invoice-${randomUUID()}`;
  await client.query(
    `INSERT INTO invoices
      (id, job_id, service_fee, urgent_surcharge, parts_cost, subtotal, vat,
       total, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Unpaid')`,
    [
      id,
      jobId,
      calculation.serviceFee,
      calculation.urgentSurcharge,
      calculation.partsCost,
      calculation.subtotal,
      calculation.vat,
      calculation.total,
    ],
  );
  return (await findInvoiceById(id, client))!;
}
