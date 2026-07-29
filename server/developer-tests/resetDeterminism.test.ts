import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { pool } from '../db/pool';
import { resetDatabase } from '../db/reset';
import { payInvoice } from '../features/invoices/invoiceService';

describe('database reset determinism', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('restores the first generated receipt number after every reset', async () => {
    const first = await payInvoice('invoice-001');

    await resetDatabase();
    const second = await payInvoice('invoice-001');

    expect(first.receiptNo).toMatch(/-1001$/);
    expect(second.receiptNo).toBe(first.receiptNo);
  });
});
