import type { Invoice, Job, UsedPart } from '../../../shared/domain';
import { apiRequest } from '../../api/client';

export const technicianApi = {
  listJobs: () => apiRequest<Job[]>('/jobs'),
  getJob: (id: string) => apiRequest<Job>(`/jobs/${id}`),
  startJob: (id: string) =>
    apiRequest<{ job: Job }>(`/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ nextStatus: 'In Progress' }),
    }),
  replaceUsedParts: (id: string, usedParts: UsedPart[]) =>
    apiRequest<Job>(`/jobs/${id}/used-parts`, {
      method: 'PUT',
      body: JSON.stringify({ usedParts }),
    }),
  completeJob: (id: string) =>
    apiRequest<{ job: Job; invoice: Invoice }>(`/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ nextStatus: 'Completed' }),
    }),
};
