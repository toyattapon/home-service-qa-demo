import type { Invoice, InvoiceStatus } from '../../../shared/domain';
import { apiRequest } from '../../api/client';

export const invoiceApi = {
  list: (status?: InvoiceStatus) =>
    apiRequest<Invoice[]>(
      `/invoices${status ? `?status=${encodeURIComponent(status)}` : ''}`,
    ),
  get: (id: string) => apiRequest<Invoice>(`/invoices/${id}`),
  pay: (id: string) =>
    apiRequest<Invoice>(`/invoices/${id}/pay`, { method: 'PATCH' }),
};
