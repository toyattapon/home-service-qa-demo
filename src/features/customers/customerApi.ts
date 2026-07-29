import type {
  Customer,
  CustomerInput,
} from '../../../shared/domain';
import { apiRequest } from '../../api/client';

export const customerApi = {
  list: (search = '') =>
    apiRequest<Customer[]>(
      `/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`,
    ),
  get: (id: string) => apiRequest<Customer>(`/customers/${id}`),
  create: (input: CustomerInput) =>
    apiRequest<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (id: string, input: CustomerInput) =>
    apiRequest<Customer>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};
