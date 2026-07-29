import { Router } from 'express';
import {
  listCustomers,
} from './customerRepository';
import {
  createCustomer,
  getCustomer,
  updateCustomer,
} from './customerService';
import {
  customerInputSchema,
  customerSearchSchema,
} from './customerSchemas';

export const customerRoutes = Router();

customerRoutes.get('/', async (request, response) => {
  const query = customerSearchSchema.parse(request.query);
  response.json({ data: await listCustomers(query.search) });
});

customerRoutes.get('/:id', async (request, response) => {
  response.json({ data: await getCustomer(request.params.id) });
});

customerRoutes.post('/', async (request, response) => {
  const input = customerInputSchema.parse(request.body);
  response.status(201).json({
    data: await createCustomer(input),
    message: 'Customer created successfully',
  });
});

customerRoutes.patch('/:id', async (request, response) => {
  const input = customerInputSchema.parse(request.body);
  response.json({
    data: await updateCustomer(request.params.id, input),
    message: 'Customer updated successfully',
  });
});
