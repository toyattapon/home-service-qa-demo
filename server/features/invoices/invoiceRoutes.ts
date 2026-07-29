import { Router } from 'express';
import { z } from 'zod';
import { listInvoices } from './invoiceRepository';
import {
  generateInvoice,
  getInvoice,
  payInvoice,
} from './invoiceService';

const invoiceFilterSchema = z.object({
  status: z.enum(['Unpaid', 'Paid']).optional(),
});

const generateSchema = z
  .object({
    jobId: z.string().trim().min(1),
  })
  .strict();

export const invoiceRoutes = Router();

invoiceRoutes.get('/', async (request, response) => {
  const query = invoiceFilterSchema.parse(request.query);
  response.json({ data: await listInvoices(query.status) });
});

invoiceRoutes.get('/:id', async (request, response) => {
  response.json({ data: await getInvoice(request.params.id) });
});

invoiceRoutes.post('/generate', async (request, response) => {
  const input = generateSchema.parse(request.body);
  const result = await generateInvoice(input.jobId);
  response.status(result.created ? 201 : 200).json({
    data: result.invoice,
    message: result.created
      ? 'Invoice generated successfully'
      : 'Existing invoice returned',
  });
});

invoiceRoutes.patch('/:id/pay', async (request, response) => {
  response.json({
    data: await payInvoice(request.params.id),
    message: 'Invoice paid successfully',
  });
});
