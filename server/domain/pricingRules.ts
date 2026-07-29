import type {
  InventoryItem,
  InvoiceCalculation,
  Job,
} from '../../shared/domain';
import { DomainRuleError } from './DomainRuleError';

export const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateServiceFee(
  job: Pick<Job, 'serviceType' | 'numberOfUnits'>,
): number {
  switch (job.serviceType) {
    case 'Cleaning':
      return 600 * job.numberOfUnits;
    case 'Repair':
      return 300;
    case 'Installation':
      return 1500 * job.numberOfUnits;
  }
}

export function calculatePartsCost(
  job: Pick<Job, 'usedParts'>,
  inventoryItems: InventoryItem[],
): number {
  const byId = new Map(inventoryItems.map((item) => [item.id, item]));
  return job.usedParts.reduce((total, part) => {
    const item = byId.get(part.inventoryItemId);
    if (!item) {
      throw new DomainRuleError(
        'INVENTORY_ITEM_NOT_FOUND',
        'Inventory item not found',
      );
    }
    return total + item.unitCost * part.quantity;
  }, 0);
}

export function calculateInvoice(
  job: Pick<
    Job,
    'serviceType' | 'numberOfUnits' | 'priority' | 'usedParts'
  >,
  inventoryItems: InventoryItem[],
): InvoiceCalculation {
  const serviceFee = calculateServiceFee(job);
  const urgentSurcharge = job.priority === 'Urgent' ? 300 : 0;
  const partsCost = calculatePartsCost(job, inventoryItems);
  const subtotal = roundMoney(serviceFee + urgentSurcharge + partsCost);
  const vat = roundMoney(subtotal * 0.07);
  const total = roundMoney(subtotal + vat);

  return {
    serviceFee,
    urgentSurcharge,
    partsCost,
    subtotal,
    vat,
    total,
  };
}
