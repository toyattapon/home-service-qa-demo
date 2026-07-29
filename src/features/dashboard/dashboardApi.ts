import type { DashboardSummary } from '../../../shared/domain';
import { apiRequest } from '../../api/client';

export const getDashboardSummary = () =>
  apiRequest<DashboardSummary>('/dashboard/summary');
