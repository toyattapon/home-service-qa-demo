import { describe, expect, it } from 'vitest';
import type { Job } from '../../shared/domain';
import { hasScheduleConflict } from '../domain/schedulingRules';

const existing = (values: Partial<Job> = {}): Job => ({
  id: 'job-existing',
  customerId: 'cus-001',
  serviceType: 'Cleaning',
  preferredDate: '2026-08-01',
  timeSlot: '10:00-12:00',
  technicianId: 'tech-001',
  numberOfUnits: 1,
  priority: 'Normal',
  status: 'Assigned',
  usedParts: [],
  createdAt: '',
  updatedAt: '',
  ...values,
});

describe('technician scheduling', () => {
  it('conflicts only for the same technician, date, slot, and active status', () => {
    const candidate = existing({ id: 'job-candidate' });
    expect(hasScheduleConflict(candidate, [existing()])).toBe(true);
    expect(
      hasScheduleConflict(candidate, [
        existing({ technicianId: 'tech-002' }),
      ]),
    ).toBe(false);
    expect(
      hasScheduleConflict(candidate, [
        existing({ preferredDate: '2026-08-02' }),
      ]),
    ).toBe(false);
    expect(
      hasScheduleConflict(candidate, [
        existing({ timeSlot: '13:00-15:00' }),
      ]),
    ).toBe(false);
  });

  it('does not conflict with itself during reassignment', () => {
    expect(hasScheduleConflict(existing(), [existing()])).toBe(false);
  });

  it.each(['Completed', 'Cancelled'] as const)(
    'does not conflict with a %s job',
    (status) => {
      expect(
        hasScheduleConflict(existing({ id: 'candidate' }), [
          existing({ status }),
        ]),
      ).toBe(false);
    },
  );
});
