import { randomUUID } from 'node:crypto';
import type { PoolClient, QueryResultRow } from 'pg';
import type {
  CreateJobInput,
  Job,
  JobFilters,
  UsedPart,
} from '../../../shared/domain';
import { pool } from '../../db/pool';

export type Queryable = Pick<PoolClient, 'query'>;

interface JobRow extends QueryResultRow {
  id: string;
  customer_id: string;
  service_type: Job['serviceType'];
  preferred_date: string;
  time_slot: Job['timeSlot'];
  technician_id: string | null;
  number_of_units: number;
  priority: Job['priority'];
  problem_description: string | null;
  status: Job['status'];
  created_at: Date;
  updated_at: Date;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  technician_name: string | null;
  invoice_id: string | null;
  used_parts: UsedPart[];
}

const jobSelect = `
  SELECT
    j.id,
    j.customer_id,
    j.service_type,
    j.preferred_date::text,
    j.time_slot,
    j.technician_id,
    j.number_of_units,
    j.priority,
    j.problem_description,
    j.status,
    j.created_at,
    j.updated_at,
    c.name AS customer_name,
    c.phone AS customer_phone,
    c.address AS customer_address,
    t.name AS technician_name,
    inv.id AS invoice_id,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'inventoryItemId', parts.inventory_item_id,
            'quantity', parts.quantity
          )
          ORDER BY parts.inventory_item_id
        )
        FROM job_used_parts parts
        WHERE parts.job_id = j.id
      ),
      '[]'::jsonb
    ) AS used_parts
  FROM jobs j
  JOIN customers c ON c.id = j.customer_id
  LEFT JOIN technicians t ON t.id = j.technician_id
  LEFT JOIN invoices inv ON inv.job_id = j.id
`;

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    customerId: row.customer_id,
    serviceType: row.service_type,
    preferredDate: row.preferred_date,
    timeSlot: row.time_slot,
    ...(row.technician_id ? { technicianId: row.technician_id } : {}),
    numberOfUnits: row.number_of_units,
    priority: row.priority,
    ...(row.problem_description
      ? { problemDescription: row.problem_description }
      : {}),
    status: row.status,
    usedParts: row.used_parts,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    ...(row.technician_name ? { technicianName: row.technician_name } : {}),
    ...(row.invoice_id ? { invoiceId: row.invoice_id } : {}),
  };
}

export async function listJobs(
  filters: JobFilters,
  forcedTechnicianId?: string,
): Promise<Job[]> {
  const technicianId = forcedTechnicianId ?? filters.technicianId ?? null;
  const result = await pool.query<JobRow>(
    `${jobSelect}
     WHERE ($1::text IS NULL OR j.status = $1)
       AND (
         $2::text IS NULL
         OR c.name ILIKE '%' || $2 || '%'
         OR c.phone LIKE '%' || $2 || '%'
       )
       AND ($3::date IS NULL OR j.preferred_date = $3)
       AND ($4::text IS NULL OR j.technician_id = $4)
     ORDER BY j.preferred_date DESC, j.time_slot, j.created_at DESC`,
    [
      filters.status ?? null,
      filters.search || null,
      filters.date ?? null,
      technicianId,
    ],
  );
  return result.rows.map(mapJob);
}

export async function findJobById(
  id: string,
  queryable: Queryable = pool,
): Promise<Job | undefined> {
  const result = await queryable.query<JobRow>(
    `${jobSelect} WHERE j.id = $1`,
    [id],
  );
  return result.rows[0] ? mapJob(result.rows[0]) : undefined;
}

export async function insertJob(
  input: CreateJobInput,
): Promise<Job> {
  const id = `job-${randomUUID()}`;
  await pool.query(
    `INSERT INTO jobs
      (id, customer_id, service_type, preferred_date, time_slot, technician_id,
       number_of_units, priority, problem_description, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      id,
      input.customerId,
      input.serviceType,
      input.preferredDate,
      input.timeSlot,
      input.technicianId ?? null,
      input.numberOfUnits,
      input.priority,
      input.problemDescription ?? null,
      input.technicianId ? 'Assigned' : 'Pending',
    ],
  );
  return (await findJobById(id))!;
}
