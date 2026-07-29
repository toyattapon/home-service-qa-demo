import { describe, expect, it } from 'vitest';
import type { InventoryItem, UsedPart } from '../../shared/domain';
import {
  assertAvailableStock,
  isLowStock,
  validateUsedParts,
} from '../domain/inventoryRules';

const inventory: InventoryItem[] = [
  {
    id: 'inv-001',
    name: 'Air Filter',
    stock: 3,
    safetyStock: 3,
    unitCost: 150,
  },
  {
    id: 'inv-002',
    name: 'Drain Pipe',
    stock: 1,
    safetyStock: 2,
    unitCost: 120,
  },
];

describe('inventory rules', () => {
  it('marks stock equal to safety stock as low', () => {
    expect(isLowStock(inventory[0])).toBe(true);
  });

  it('accepts a valid used-parts draft', () => {
    const parts: UsedPart[] = [
      { inventoryItemId: 'inv-001', quantity: 2 },
    ];
    expect(validateUsedParts(parts, inventory)).toEqual(parts);
    expect(() => assertAvailableStock(parts, inventory)).not.toThrow();
  });

  it.each([
    [[{ inventoryItemId: 'missing', quantity: 1 }], 'INVENTORY_ITEM_NOT_FOUND'],
    [[{ inventoryItemId: 'inv-001', quantity: 0 }], 'VALIDATION_ERROR'],
    [
      [
        { inventoryItemId: 'inv-001', quantity: 1 },
        { inventoryItemId: 'inv-001', quantity: 1 },
      ],
      'VALIDATION_ERROR',
    ],
  ] as const)('rejects invalid used parts', (parts, code) => {
    expect(() =>
      validateUsedParts(parts as unknown as UsedPart[], inventory),
    ).toThrowError(expect.objectContaining({ code }));
  });

  it('rejects insufficient stock', () => {
    expect(() =>
      assertAvailableStock(
        [{ inventoryItemId: 'inv-002', quantity: 2 }],
        inventory,
      ),
    ).toThrowError(expect.objectContaining({ code: 'INSUFFICIENT_STOCK' }));
  });
});
