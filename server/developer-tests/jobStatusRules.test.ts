import { describe, expect, it } from 'vitest';
import type { JobStatus } from '../../shared/domain';
import {
  canTransitionJobStatus,
  getAllowedNextStatuses,
} from '../domain/jobStatusRules';

const statuses: JobStatus[] = [
  'Pending',
  'Assigned',
  'In Progress',
  'Completed',
  'Cancelled',
];

const allowed: Record<JobStatus, JobStatus[]> = {
  Pending: ['Assigned', 'Cancelled'],
  Assigned: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed'],
  Completed: [],
  Cancelled: [],
};

describe('job status transitions', () => {
  it.each(statuses)('returns the allowed next statuses for %s', (status) => {
    expect(getAllowedNextStatuses(status)).toEqual(allowed[status]);
  });

  it.each(
    statuses.flatMap((current) =>
      statuses.map(
        (next) =>
          [current, next, allowed[current].includes(next)] as const,
      ),
    ),
  )('%s -> %s is %s', (current, next, expected) => {
    expect(canTransitionJobStatus(current, next)).toBe(expected);
  });
});
