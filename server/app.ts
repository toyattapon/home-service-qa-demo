import cors from 'cors';
import express from 'express';
import { config } from './config';
import { authRoutes } from './features/auth/authRoutes';
import { customerRoutes } from './features/customers/customerRoutes';
import { dashboardRoutes } from './features/dashboard/dashboardRoutes';
import { healthRoutes } from './features/health/healthRoutes';
import { inventoryRoutes } from './features/inventory/inventoryRoutes';
import { invoiceRoutes } from './features/invoices/invoiceRoutes';
import { jobRoutes } from './features/jobs/jobRoutes';
import { testRoutes } from './features/test/testRoutes';
import { technicianRoutes } from './features/technicians/technicianRoutes';
import { authenticate } from './middleware/authenticate';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { requireRole } from './middleware/requireRole';

export const app = express();

app.disable('x-powered-by');
app.use(
  cors({
    origin: config.webOrigin,
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(requestLogger);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use(
  '/api/customers',
  authenticate,
  requireRole('admin'),
  customerRoutes,
);
app.use(
  '/api/technicians',
  authenticate,
  requireRole('admin'),
  technicianRoutes,
);
app.use(
  '/api/dashboard',
  authenticate,
  requireRole('admin'),
  dashboardRoutes,
);
app.use('/api/jobs', authenticate, jobRoutes);
app.use(
  '/api/inventory',
  authenticate,
  inventoryRoutes,
);
app.use(
  '/api/invoices',
  authenticate,
  requireRole('admin'),
  invoiceRoutes,
);

app.use(notFoundHandler);
app.use(errorHandler);
