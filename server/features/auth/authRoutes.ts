import { Router } from 'express';
import { z } from 'zod';
import { login } from './authService';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Email is invalid'),
  password: z.string().min(1, 'Password is required'),
});

export const authRoutes = Router();

authRoutes.post('/login', async (request, response) => {
  const input = loginSchema.parse(request.body);
  const data = await login(input.email, input.password);
  response.json({ data });
});
