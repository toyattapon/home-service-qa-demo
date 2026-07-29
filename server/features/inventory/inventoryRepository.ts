import type { QueryResultRow } from 'pg';
import type { InventoryItem } from '../../../shared/domain';
import { pool } from '../../db/pool';
import { AppError } from '../../errors/AppError';

interface InventoryRow extends QueryResultRow {
  id: string;
  name: string;
  stock: number;
  safety_stock: number;
  unit_cost: number;
}

export function mapInventoryItem(row: InventoryRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    stock: row.stock,
    safetyStock: row.safety_stock,
    unitCost: row.unit_cost,
    lowStock: row.stock <= row.safety_stock,
  };
}

export async function listInventory(): Promise<InventoryItem[]> {
  const result = await pool.query<InventoryRow>(
    `SELECT id, name, stock, safety_stock, unit_cost
     FROM inventory_items
     ORDER BY name, id`,
  );
  return result.rows.map(mapInventoryItem);
}

export async function adjustInventory(
  id: string,
  type: 'in' | 'out',
  quantity: number,
): Promise<InventoryItem> {
  const result = await pool.query<InventoryRow>(
    `UPDATE inventory_items
     SET stock = stock + CASE WHEN $2 = 'in' THEN $3 ELSE -$3 END,
         updated_at = now()
     WHERE id = $1
       AND ($2 = 'in' OR stock >= $3)
     RETURNING id, name, stock, safety_stock, unit_cost`,
    [id, type, quantity],
  );
  if (result.rows[0]) {
    return mapInventoryItem(result.rows[0]);
  }

  const exists = await pool.query('SELECT 1 FROM inventory_items WHERE id = $1', [
    id,
  ]);
  if (!exists.rowCount) {
    throw new AppError(404, 'NOT_FOUND', 'Inventory item not found');
  }
  throw new AppError(
    400,
    'STOCK_CANNOT_BE_NEGATIVE',
    'Stock cannot be negative',
  );
}
