import type {
  CreateJobInput,
  Job,
  JobFilters,
  JobStatus,
  Technician,
} from '../../../shared/domain';
import { apiRequest } from '../../api/client';

export const jobApi = {
  list: (filters: JobFilters = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    const suffix = query.size ? `?${query.toString()}` : '';
    return apiRequest<Job[]>(`/jobs${suffix}`);
  },
  get: (id: string) => apiRequest<Job>(`/jobs/${id}`),
  create: (input: CreateJobInput) =>
    apiRequest<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  assign: (id: string, technicianId: string) =>
    apiRequest<Job>(`/jobs/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ technicianId }),
    }),
  updateStatus: (
    id: string,
    nextStatus: JobStatus,
  ) =>
    apiRequest<{ job: Job; invoice?: import('../../../shared/domain').Invoice }>(
      `/jobs/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ nextStatus }),
      },
    ),
  technicians: () => apiRequest<Technician[]>('/technicians'),
};
