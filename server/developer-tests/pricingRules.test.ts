import { describe, expect, it } from 'vitest';
import type { InventoryItem, Job } from '../../shared/domain';
import { calculateInvoice } from '../domain/pricingRules';

const inventory: InventoryItem[] = [
  {
    id: 'inv-001',
    name: 'Air Filter',
    stock: 10,
    safetyStock: 3,
    unitCost: 150,
  },
  {
    id: 'inv-002',
    name: 'Drain Pipe',
    stock: 2,
    safetyStock: 2,
    unitCost: 120,
  },
  {
    id: 'inv-003',
    name: 'Capacitor',
    stock: 1,
    safetyStock: 2,
    unitCost: 250,
  },
];

const job = (
  values: Partial<
    Pick<Job, 'serviceType' | 'numberOfUnits' | 'priority' | 'usedParts'>
  >,
) => ({
  serviceType: 'Cleaning' as const,
  numberOfUnits: 1,
  priority: 'Normal' as const,
  usedParts: [],
  ...values,
});

describe('invoice pricing', () => {
  it.each([
    [job({ serviceType: 'Cleaning' }), [600, 0, 0, 600, 42, 642]],
    [
      job({
        serviceType: 'Cleaning',
        numberOfUnits: 2,
        priority: 'Urgent',
      }),
      [1200, 300, 0, 1500, 105, 1605],
    ],
    [
      job({
        serviceType: 'Repair',
        usedParts: [{ inventoryItemId: 'inv-003', quantity: 1 }],
      }),
      [300, 0, 250, 550, 38.5, 588.5],
    ],
    [
      job({
        serviceType: 'Installation',
        numberOfUnits: 2,
        priority: 'Urgent',
        usedParts: [
          { inventoryItemId: 'inv-001', quantity: 1 },
          { inventoryItemId: 'inv-002', quantity: 1 },
        ],
      }),
      [3000, 300, 270, 3570, 249.9, 3819.9],
    ],
  ])('calculates the pricing decision table', (input, expected) => {
    expect(Object.values(calculateInvoice(input, inventory))).toEqual(expected);
  });

  it('rounds VAT and total to two decimal places', () => {
    expect(
      calculateInvoice(
        job({
          serviceType: 'Repair',
          usedParts: [{ inventoryItemId: 'inv-002', quantity: 1 }],
        }),
        inventory,
      ),
    ).toMatchObject({ subtotal: 420, vat: 29.4, total: 449.4 });
  });
});
