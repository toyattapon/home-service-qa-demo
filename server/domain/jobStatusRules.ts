import type { JobStatus } from '../../shared/domain';

const allowedTransitions: Record<JobStatus, readonly JobStatus[]> = {
  Pending: ['Assigned', 'Cancelled'],
  Assigned: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed'],
  Completed: [],
  Cancelled: [],
};

export function getAllowedNextStatuses(status: JobStatus): JobStatus[] {
  return [...allowedTransitions[status]];
}

export function canTransitionJobStatus(
  currentStatus: JobStatus,
  nextStatus: JobStatus,
): boolean {
  return allowedTransitions[currentStatus].includes(nextStatus);
}
