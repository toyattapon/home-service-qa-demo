import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../middleware/requireRole';
import { adjustInventory, listInventory } from './inventoryRepository';

const adjustmentSchema = z
  .object({
    type: z.enum(['in', 'out']),
    quantity: z.coerce.number().int().positive(),
  })
  .strict();

export const inventoryRoutes = Router();

inventoryRoutes.get('/', async (_request, response) => {
  response.json({ data: await listInventory() });
});

inventoryRoutes.patch('/:id/adjust', requireRole('admin'), async (request, response) => {
  const input = adjustmentSchema.parse(request.body);
  response.json({
    data: await adjustInventory(
      String(request.params.id),
      input.type,
      input.quantity,
    ),
    message: 'Inventory adjusted successfully',
  });
});
