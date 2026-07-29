import { z } from 'zod';

const optionalTrimmed = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .optional()
    .transform((value) => value || undefined);

export const customerInputSchema = z
  .object({
    name: z.string().trim().min(2).max(50),
    phone: z
      .string()
      .regex(/^\d{10}$/, 'Phone number must be 10 digits'),
    address: z.string().trim().min(5).max(200),
    acBrand: optionalTrimmed(100),
    btu: z.preprocess(
      (value) => Number(value),
      z.union([
        z.literal(9000),
        z.literal(12000),
        z.literal(18000),
        z.literal(24000),
      ]),
    ),
    acType: z.enum([
      'Wall Type',
      'Cassette',
      'Floor Standing',
      'Portable',
    ]),
    note: optionalTrimmed(300),
  })
  .strict();

export const customerSearchSchema = z.object({
  search: z.string().trim().max(100).optional(),
});
