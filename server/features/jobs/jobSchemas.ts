import { z } from 'zod';

export const jobInputSchema = z
  .object({
    customerId: z.string().trim().min(1),
    serviceType: z.enum(['Cleaning', 'Repair', 'Installation']),
    preferredDate: z.string().date(),
    timeSlot: z.enum([
      '08:00-10:00',
      '10:00-12:00',
      '13:00-15:00',
      '15:00-17:00',
    ]),
    technicianId: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined),
    numberOfUnits: z.coerce.number().int().min(1).max(5),
    priority: z.enum(['Normal', 'Urgent']),
    problemDescription: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((value) => value || undefined),
  })
  .strict();

export const jobFilterSchema = z.object({
  status: z
    .enum(['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'])
    .optional(),
  search: z.string().trim().max(100).optional(),
  date: z.string().date().optional(),
  technicianId: z.string().trim().optional(),
});

export const assignmentSchema = z
  .object({
    technicianId: z.string().trim().min(1),
  })
  .strict();

export const statusSchema = z
  .object({
    nextStatus: z.enum([
      'Pending',
      'Assigned',
      'In Progress',
      'Completed',
      'Cancelled',
    ]),
  })
  .strict();

export const usedPartsSchema = z
  .object({
    usedParts: z.array(
      z
        .object({
          inventoryItemId: z.string().trim().min(1),
          quantity: z.coerce.number().int().positive(),
        })
        .strict(),
    ),
  })
  .strict();
