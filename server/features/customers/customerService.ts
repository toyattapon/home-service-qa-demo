import type { Customer, CustomerInput } from '../../../shared/domain';
import { AppError } from '../../errors/AppError';
import {
  findCustomerById,
  insertCustomer,
  updateCustomerRecord,
} from './customerRepository';

export async function getCustomer(id: string): Promise<Customer> {
  const customer = await findCustomerById(id);
  if (!customer) {
    throw new AppError(404, 'NOT_FOUND', 'Customer not found');
  }
  return customer;
}

export async function createCustomer(
  input: CustomerInput,
): Promise<Customer> {
  return insertCustomer(input);
}

export async function updateCustomer(
  id: string,
  input: CustomerInput,
): Promise<Customer> {
  const customer = await updateCustomerRecord(id, input);
  if (!customer) {
    throw new AppError(404, 'NOT_FOUND', 'Customer not found');
  }
  return customer;
}
