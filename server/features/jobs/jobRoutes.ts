import { Router } from 'express';
import type { AuthenticatedRequest } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { listJobs } from './jobRepository';
import {
  assignTechnician,
  createJob,
  getJobForActor,
  replaceUsedParts,
  updateJobStatus,
} from './jobService';
import {
  assignmentSchema,
  jobFilterSchema,
  jobInputSchema,
  statusSchema,
  usedPartsSchema,
} from './jobSchemas';

export const jobRoutes = Router();

jobRoutes.get('/', async (request: AuthenticatedRequest, response) => {
  const filters = jobFilterSchema.parse(request.query);
  const actor = request.authUser!;
  response.json({
    data: await listJobs(
      filters,
      actor.role === 'technician' ? actor.technicianId : undefined,
    ),
  });
});

jobRoutes.get('/:id', async (request: AuthenticatedRequest, response) => {
  response.json({
    data: await getJobForActor(String(request.params.id), request.authUser!),
  });
});

jobRoutes.post(
  '/',
  requireRole('admin'),
  async (request, response) => {
    const input = jobInputSchema.parse(request.body);
    response.status(201).json({
      data: await createJob(input),
      message: 'Job created successfully',
    });
  },
);

jobRoutes.patch(
  '/:id/assign',
  requireRole('admin'),
  async (request, response) => {
    const input = assignmentSchema.parse(request.body);
    response.json({
      data: await assignTechnician(
        String(request.params.id),
        input.technicianId,
      ),
      message: 'Technician assigned successfully',
    });
  },
);

jobRoutes.patch(
  '/:id/status',
  async (request: AuthenticatedRequest, response) => {
    const input = statusSchema.parse(request.body);
    response.json({
      data: await updateJobStatus(
        String(request.params.id),
        input.nextStatus,
        request.authUser!,
      ),
      message: 'Job status updated successfully',
    });
  },
);

jobRoutes.put(
  '/:id/used-parts',
  requireRole('technician'),
  async (request: AuthenticatedRequest, response) => {
    const input = usedPartsSchema.parse(request.body);
    response.json({
      data: await replaceUsedParts(
        String(request.params.id),
        input.usedParts,
        request.authUser!,
      ),
      message: 'Used parts updated successfully',
    });
  },
);
