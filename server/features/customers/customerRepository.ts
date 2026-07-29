import { randomUUID } from 'node:crypto';
import type { PoolClient, QueryResultRow } from 'pg';
import type { Customer, CustomerInput } from '../../../shared/domain';
import { pool } from '../../db/pool';

interface CustomerRow extends QueryResultRow {
  id: string;
  name: string;
  phone: string;
  address: string;
  ac_brand: string | null;
  btu: Customer['btu'];
  ac_type: Customer['acType'];
  note: string | null;
  created_at: Date;
  updated_at: Date;
}

export function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    ...(row.ac_brand ? { acBrand: row.ac_brand } : {}),
    btu: row.btu,
    acType: row.ac_type,
    ...(row.note ? { note: row.note } : {}),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const customerColumns = `
  id, name, phone, address, ac_brand, btu, ac_type, note, created_at, updated_at
`;

export async function listCustomers(search?: string): Promise<Customer[]> {
  const result = await pool.query<CustomerRow>(
    `SELECT ${customerColumns}
     FROM customers
     WHERE $1::text IS NULL
        OR name ILIKE '%' || $1 || '%'
        OR phone LIKE '%' || $1 || '%'
     ORDER BY name, id`,
    [search || null],
  );
  return result.rows.map(mapCustomer);
}

export async function findCustomerById(
  id: string,
  client: Pick<PoolClient, 'query'> = pool,
): Promise<Customer | undefined> {
  const result = await client.query<CustomerRow>(
    `SELECT ${customerColumns} FROM customers WHERE id = $1`,
    [id],
  );
  return result.rows[0] ? mapCustomer(result.rows[0]) : undefined;
}

export async function insertCustomer(
  input: CustomerInput,
): Promise<Customer> {
  const id = `cus-${randomUUID()}`;
  const result = await pool.query<CustomerRow>(
    `INSERT INTO customers
      (id, name, phone, address, ac_brand, btu, ac_type, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${customerColumns}`,
    [
      id,
      input.name,
      input.phone,
      input.address,
      input.acBrand ?? null,
      input.btu,
      input.acType,
      input.note ?? null,
    ],
  );
  return mapCustomer(result.rows[0]);
}

export async function updateCustomerRecord(
  id: string,
  input: CustomerInput,
): Promise<Customer | undefined> {
  const result = await pool.query<CustomerRow>(
    `UPDATE customers
     SET name = $2,
         phone = $3,
         address = $4,
         ac_brand = $5,
         btu = $6,
         ac_type = $7,
         note = $8,
         updated_at = now()
     WHERE id = $1
     RETURNING ${customerColumns}`,
    [
      id,
      input.name,
      input.phone,
      input.address,
      input.acBrand ?? null,
      input.btu,
      input.acType,
      input.note ?? null,
    ],
  );
  return result.rows[0] ? mapCustomer(result.rows[0]) : undefined;
}
