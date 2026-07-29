import { fileURLToPath } from 'node:url';
import type { PoolClient } from 'pg';
import { pool } from './pool';
import { withTransaction } from './transaction';

export function bangkokDate(offsetDays: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

async function insertSeedData(client: PoolClient): Promise<void> {
  await client.query(
    `INSERT INTO users (id, name, email, password, role) VALUES
      ('user-admin-001', 'Demo Admin', 'admin@demo.com', 'password123', 'admin'),
      ('user-tech-001', 'Demo Technician', 'tech@demo.com', 'password123', 'technician')`,
  );

  await client.query(
    `INSERT INTO technicians (id, user_id, name, phone, active, skill_tags) VALUES
      ('tech-001', 'user-tech-001', 'Demo Technician', '0811111111', true, ARRAY['Cleaning', 'Repair']),
      ('tech-002', NULL, 'Second Technician', '0822222222', true, ARRAY['Cleaning', 'Installation'])`,
  );

  await client.query(
    `INSERT INTO customers
      (id, name, phone, address, ac_brand, btu, ac_type, note) VALUES
      ('cus-001', 'Arun Home', '0812345678', 'Bangkok, Thailand', 'Daikin', 12000, 'Wall Type', 'Residential customer'),
      ('cus-002', 'Mali Residence', '0898765432', 'Chonburi, Thailand', 'Mitsubishi', 18000, 'Cassette', NULL),
      ('cus-003', 'Somchai Office', '0861234567', 'Rayong, Thailand', 'Carrier', 24000, 'Floor Standing', 'Office building')`,
  );

  await client.query(
    `INSERT INTO inventory_items
      (id, name, stock, safety_stock, unit_cost) VALUES
      ('inv-001', 'Air Filter', 10, 3, 150),
      ('inv-002', 'Drain Pipe', 2, 2, 120),
      ('inv-003', 'Capacitor', 1, 2, 250),
      ('inv-004', 'Cleaning Spray', 8, 3, 80)`,
  );

  await client.query(
    `INSERT INTO jobs
      (id, customer_id, service_type, preferred_date, time_slot, technician_id,
       number_of_units, priority, problem_description, status) VALUES
      ('job-001', 'cus-001', 'Cleaning', $1, '10:00-12:00', NULL, 1, 'Normal', 'Regular cleaning', 'Pending'),
      ('job-002', 'cus-002', 'Cleaning', $1, '10:00-12:00', 'tech-001', 2, 'Normal', 'Two indoor units', 'Assigned'),
      ('job-003', 'cus-003', 'Repair', $1, '13:00-15:00', 'tech-001', 1, 'Urgent', 'Not cooling', 'In Progress'),
      ('job-004', 'cus-001', 'Installation', $2, '08:00-10:00', 'tech-002', 1, 'Normal', 'New installation', 'Completed'),
      ('job-005', 'cus-002', 'Cleaning', $3, '15:00-17:00', NULL, 1, 'Normal', NULL, 'Cancelled'),
      ('job-006', 'cus-003', 'Repair', $4, '13:00-15:00', 'tech-002', 1, 'Urgent', 'Capacitor replacement', 'Completed')`,
    [
      bangkokDate(1),
      bangkokDate(-1),
      bangkokDate(2),
      bangkokDate(-2),
    ],
  );

  await client.query(
    `INSERT INTO job_used_parts (job_id, inventory_item_id, quantity) VALUES
      ('job-004', 'inv-004', 2),
      ('job-006', 'inv-003', 1)`,
  );

  await client.query(
    `INSERT INTO invoices
      (id, job_id, service_fee, urgent_surcharge, parts_cost, subtotal, vat,
       total, status, receipt_no, paid_at) VALUES
      ('invoice-001', 'job-004', 1500, 0, 160, 1660, 116.20, 1776.20, 'Unpaid', NULL, NULL),
      ('invoice-002', 'job-006', 300, 300, 250, 850, 59.50, 909.50, 'Paid', 'RCP-SEED-0001', now() - interval '2 days')`,
  );
}

export async function resetDatabase(): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(`
      TRUNCATE TABLE
        invoices,
        job_used_parts,
        jobs,
        inventory_items,
        customers,
        technicians,
        users
      RESTART IDENTITY CASCADE
    `);
    await client.query('ALTER SEQUENCE receipt_number_seq RESTART WITH 1001');
    await insertSeedData(client);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  resetDatabase()
    .then(() => {
      console.info('Database reset completed.');
    })
    .finally(() => pool.end());
}
