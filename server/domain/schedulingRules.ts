import type { Job } from '../../shared/domain';

export function hasScheduleConflict(
  candidate: Pick<
    Job,
    'id' | 'technicianId' | 'preferredDate' | 'timeSlot'
  >,
  jobs: Job[],
): boolean {
  if (!candidate.technicianId) {
    return false;
  }

  return jobs.some(
    (job) =>
      job.id !== candidate.id &&
      job.technicianId === candidate.technicianId &&
      job.preferredDate === candidate.preferredDate &&
      job.timeSlot === candidate.timeSlot &&
      (job.status === 'Assigned' || job.status === 'In Progress'),
  );
}
