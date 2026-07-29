import type { InventoryItem } from '../../../shared/domain';
import { apiRequest } from '../../api/client';

export const inventoryApi = {
  list: () => apiRequest<InventoryItem[]>('/inventory'),
  adjust: (id: string, type: 'in' | 'out', quantity: number) =>
    apiRequest<InventoryItem>(`/inventory/${id}/adjust`, {
      method: 'PATCH',
      body: JSON.stringify({ type, quantity }),
    }),
};
