import type { InventoryItem, UsedPart } from '../../shared/domain';
import { DomainRuleError } from './DomainRuleError';

export function isLowStock(item: InventoryItem): boolean {
  return item.stock <= item.safetyStock;
}

export function validateUsedParts(
  usedParts: UsedPart[],
  inventoryItems: InventoryItem[],
): UsedPart[] {
  const inventoryIds = new Set(inventoryItems.map((item) => item.id));
  const seen = new Set<string>();

  for (const part of usedParts) {
    if (!inventoryIds.has(part.inventoryItemId)) {
      throw new DomainRuleError(
        'INVENTORY_ITEM_NOT_FOUND',
        'Inventory item not found',
      );
    }
    if (!Number.isInteger(part.quantity) || part.quantity <= 0) {
      throw new DomainRuleError(
        'VALIDATION_ERROR',
        'Used part quantity must be a positive integer',
      );
    }
    if (seen.has(part.inventoryItemId)) {
      throw new DomainRuleError(
        'VALIDATION_ERROR',
        'Duplicate inventory items are not allowed',
      );
    }
    seen.add(part.inventoryItemId);
  }

  return usedParts.map((part) => ({ ...part }));
}

export function assertAvailableStock(
  usedParts: UsedPart[],
  inventoryItems: InventoryItem[],
): void {
  validateUsedParts(usedParts, inventoryItems);
  const byId = new Map(inventoryItems.map((item) => [item.id, item]));

  for (const part of usedParts) {
    const item = byId.get(part.inventoryItemId);
    if (!item || item.stock < part.quantity) {
      throw new DomainRuleError('INSUFFICIENT_STOCK', 'Insufficient stock');
    }
  }
}
