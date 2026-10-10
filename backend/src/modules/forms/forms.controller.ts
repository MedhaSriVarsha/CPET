import { Request, Response, NextFunction } from 'express';
import { formsService } from './forms.service.js';
import { ValidationError } from '../../utils/errors.js';

export class FormsController {
  /**
   * POST /api/v1/forms
   * Create a new dynamic form (Organization / Admin)
   */
  public createForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) throw new ValidationError('Authentication required');

      const { title, description, category, department, isPublic, status, slaHours, priority, fields, submitButtonText, successMessage } = req.body;
      if (!title || !category) {
        throw new ValidationError('Form title and category are required');
      }

      const created = await formsService.createForm(
        {
          title,
          description,
          category,
          department,
          isPublic,
          status,
          slaHours,
          priority,
          fields: fields || [],
          submitButtonText,
          successMessage,
        },
        user
      );

      res.status(201).json({
        success: true,
        message: 'Form created successfully',
        data: created,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/forms
   * Get forms list with filters
   */
  public getForms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, isPublic, status, category, search, type } = req.query;
      const forms = await formsService.getForms({
        organizationId: organizationId as string,
        isPublic: isPublic !== undefined ? isPublic === 'true' : undefined,
        status: status as string,
        category: category as string,
        search: search as string,
        type: type as any,
      });

      res.status(200).json({
        success: true,
        count: forms.length,
        data: forms,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/forms/public
   * Get all public & discoverable forms (for Citizens & Guest visitors)
   */
  public getPublicForms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, search, type } = req.query;
      const forms = await formsService.getForms({
        isPublic: true,
        status: 'PUBLISHED',
        category: category as string,
        search: search as string,
        type: type as any,
      });

      res.status(200).json({
        success: true,
        count: forms.length,
        data: forms,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/forms/:id
   * Get form details & fields schema
   */
  public getFormById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const form = await formsService.getFormByIdOrSlug(id);

      res.status(200).json({
        success: true,
        data: form,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT /api/v1/forms/:id
   * Update form schema and settings
   */
  public updateForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      if (!user) throw new ValidationError('Authentication required');

      const updated = await formsService.updateForm(id, req.body, user);

      res.status(200).json({
        success: true,
        message: 'Form updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE /api/v1/forms/:id
   * Archive / Delete form
   */
  public deleteForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      if (!user) throw new ValidationError('Authentication required');

      const result = await formsService.deleteForm(id, user);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/forms/:id/submit
   * Submit form answers (Citizen or Public Guest)
   */
  public submitForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const { answers, citizenInfo, attachments, location } = req.body;

      if (!answers || typeof answers !== 'object') {
        throw new ValidationError('Form answers are required');
      }

      const result = await formsService.submitForm(
        id,
        {
          formId: id,
          answers,
          citizenInfo,
          attachments,
          location,
        },
        user
      );

      res.status(201).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/forms/:id/submissions
   * Get all submissions received for a specific form (Organization / Admin)
   */
  public getFormSubmissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      if (!user) throw new ValidationError('Authentication required');

      const submissions = await formsService.getFormSubmissions(id, user);

      res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const formsController = new FormsController();
