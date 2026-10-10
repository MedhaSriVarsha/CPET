import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../../middleware/auth.js';
import { formsController } from './forms.controller.js';

export const formsRouter = Router();

/**
 * GET /api/v1/forms/public
 * Public forms catalog for discovery & public submission
 */
formsRouter.get('/public', formsController.getPublicForms);

/**
 * GET /api/v1/forms
 * Filterable forms list (for organization, admin, or discovery)
 */
formsRouter.get('/', optionalAuthenticate, formsController.getForms);

/**
 * GET /api/v1/forms/:id
 * Retrieve form schema by ID or Slug
 */
formsRouter.get('/:id', formsController.getFormById);

/**
 * POST /api/v1/forms/:id/submit
 * Submit form answers (Citizens or Anonymous Public Guests)
 */
formsRouter.post('/:id/submit', optionalAuthenticate, formsController.submitForm);

/**
 * POST /api/v1/forms
 * Create new dynamic form (Organization Admin/Agent or CPET Admin)
 */
formsRouter.post(
  '/',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'ORGANIZATION_AGENT', 'CPET_ADMIN', 'SUPER_ADMIN'),
  formsController.createForm
);

/**
 * PUT /api/v1/forms/:id
 * Update form schema & configuration (Organization Admin/Agent or CPET Admin)
 */
formsRouter.put(
  '/:id',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'ORGANIZATION_AGENT', 'CPET_ADMIN', 'SUPER_ADMIN'),
  formsController.updateForm
);

/**
 * DELETE /api/v1/forms/:id
 * Archive / Delete form (Organization Admin or CPET Admin)
 */
formsRouter.delete(
  '/:id',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'CPET_ADMIN', 'SUPER_ADMIN'),
  formsController.deleteForm
);

/**
 * GET /api/v1/forms/:id/submissions
 * Get all received submissions for this form (Organization staff or CPET Admin)
 */
formsRouter.get(
  '/:id/submissions',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'ORGANIZATION_AGENT', 'CPET_ADMIN', 'SUPER_ADMIN'),
  formsController.getFormSubmissions
);
