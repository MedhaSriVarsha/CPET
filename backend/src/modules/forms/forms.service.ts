import mongoose, { Types } from 'mongoose';
import {
  FormModel,
  CaseModel,
  CaseEventModel,
  OrganizationModel,
  NotificationModel,
  CasePriority,
} from '@cpet/database';
import {
  memoryStore,
  MemoryForm,
  MemoryCase,
  MemoryCaseEvent,
} from '../../infrastructure/store.js';
import { socketManager } from '../../infrastructure/socket.js';
import { smsNotificationService } from '../notifications/sms.service.js';
import { logger } from '../../utils/logger.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors.js';

export interface CreateFormDto {
  title: string;
  description?: string;
  category: string;
  department?: string;
  isPublic?: boolean;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  slaHours?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  fields: Array<{
    id?: string;
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'file' | 'rating' | 'location';
    placeholder?: string;
    helpText?: string;
    required?: boolean;
    options?: string[];
    defaultValue?: any;
    order?: number;
  }>;
  submitButtonText?: string;
  successMessage?: string;
}

export interface SubmitFormDto {
  formId: string;
  answers: Record<string, any>;
  citizenInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size?: number;
  }>;
  location?: {
    coordinates?: [number, number];
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export class FormsService {
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  private generateReferenceNumber(): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `CPET-${year}-${randomNum}`;
  }

  /**
   * Create a new Dynamic Form (by Organization or CPET Admin)
   */
  public async createForm(
    input: CreateFormDto,
    user: { _id: string; name: string; email: string; role: any; organizationId?: string | null; organizationName?: string | null }
  ) {
    const isDb = memoryStore.isDbConnected();
    const slug = this.generateSlug(input.title);

    let orgId: any = user.organizationId || null;
    let orgName = user.organizationName || 'Public Civic Authority';

    if (orgId && isDb) {
      const org = await OrganizationModel.findById(orgId);
      if (org) {
        orgName = org.name;
      }
    } else if (orgId && !isDb) {
      const org = memoryStore.organizations.get(orgId.toString());
      if (org) {
        orgName = org.name;
      }
    }

    const processedFields = (input.fields || []).map((f, idx) => ({
      id: f.id || `f-${Date.now()}-${idx}`,
      name: f.name || `field_${idx}`,
      label: f.label || `Field ${idx + 1}`,
      type: f.type || 'text',
      placeholder: f.placeholder || '',
      helpText: f.helpText || '',
      required: !!f.required,
      options: f.options || [],
      defaultValue: f.defaultValue,
      order: f.order ?? idx,
    }));

    if (isDb) {
      const created = await FormModel.create({
        organizationId: orgId ? new Types.ObjectId(orgId) : null,
        organizationName: orgName,
        title: input.title.trim(),
        slug,
        description: input.description || '',
        category: input.category || 'General Services',
        department: input.department || '',
        isPublic: input.isPublic !== false,
        status: input.status || 'PUBLISHED',
        slaHours: input.slaHours || 48,
        priority: input.priority || 'MEDIUM',
        fields: processedFields,
        submitButtonText: input.submitButtonText || 'Submit Form',
        successMessage: input.successMessage || 'Your submission has been received successfully.',
        submissionsCount: 0,
        publishedAt: new Date(),
        createdById: new Types.ObjectId(user._id),
        createdByName: user.name,
      });

      return created.toObject();
    } else {
      const formId = `form-${Date.now()}`;
      const memoryForm: MemoryForm = {
        _id: formId,
        organizationId: orgId?.toString() || null,
        organizationName: orgName,
        title: input.title.trim(),
        slug,
        description: input.description || '',
        category: input.category || 'General Services',
        department: input.department || '',
        isPublic: input.isPublic !== false,
        status: input.status || 'PUBLISHED',
        slaHours: input.slaHours || 48,
        priority: input.priority || 'MEDIUM',
        fields: processedFields,
        submitButtonText: input.submitButtonText || 'Submit Form',
        successMessage: input.successMessage || 'Your submission has been received successfully.',
        submissionsCount: 0,
        publishedAt: new Date(),
        createdById: user._id,
        createdByName: user.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.forms.set(formId, memoryForm);
      return memoryForm;
    }
  }

  /**
   * Get all forms with optional filters (for organization admin, public portal, or citizen discovery)
   */
  public async getForms(filters: {
    organizationId?: string;
    isPublic?: boolean;
    status?: string;
    category?: string;
    search?: string;
    type?: 'public' | 'organization' | 'all';
  }) {
    const isDb = memoryStore.isDbConnected();

    if (isDb) {
      const query: any = {};
      if (filters.organizationId) {
        query.organizationId = new Types.ObjectId(filters.organizationId);
      }
      if (filters.isPublic !== undefined) {
        query.isPublic = filters.isPublic;
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.category) {
        query.category = { $regex: new RegExp(filters.category, 'i') };
      }
      if (filters.type === 'public') {
        query.$or = [{ organizationId: null }, { isPublic: true }];
      } else if (filters.type === 'organization') {
        query.organizationId = { $ne: null };
      }

      if (filters.search) {
        const regex = new RegExp(filters.search, 'i');
        query.$or = [
          { title: regex },
          { description: regex },
          { organizationName: regex },
          { category: regex },
        ];
      }

      const forms = await FormModel.find(query).sort({ createdAt: -1 }).lean();
      return forms;
    } else {
      let allForms = Array.from(memoryStore.forms.values());

      if (filters.organizationId) {
        allForms = allForms.filter((f) => f.organizationId === filters.organizationId);
      }
      if (filters.isPublic !== undefined) {
        allForms = allForms.filter((f) => f.isPublic === filters.isPublic);
      }
      if (filters.status) {
        allForms = allForms.filter((f) => f.status === filters.status);
      }
      if (filters.category) {
        const catLower = filters.category.toLowerCase();
        allForms = allForms.filter((f) => f.category.toLowerCase().includes(catLower));
      }
      if (filters.type === 'public') {
        allForms = allForms.filter((f) => !f.organizationId || f.isPublic);
      } else if (filters.type === 'organization') {
        allForms = allForms.filter((f) => Boolean(f.organizationId));
      }

      if (filters.search) {
        const sLower = filters.search.toLowerCase();
        allForms = allForms.filter(
          (f) =>
            f.title.toLowerCase().includes(sLower) ||
            f.description.toLowerCase().includes(sLower) ||
            f.organizationName.toLowerCase().includes(sLower) ||
            f.category.toLowerCase().includes(sLower)
        );
      }

      return allForms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  /**
   * Get single form by ID or Slug (for rendering or editing)
   */
  public async getFormByIdOrSlug(idOrSlug: string) {
    const isDb = memoryStore.isDbConnected();

    if (isDb) {
      const isObjectId = mongoose.isValidObjectId(idOrSlug);
      const query = isObjectId ? { _id: new Types.ObjectId(idOrSlug) } : { slug: idOrSlug };
      const form = await FormModel.findOne(query).lean();
      if (!form) {
        throw new NotFoundError(`Form '${idOrSlug}' not found`);
      }
      return form;
    } else {
      let form = memoryStore.forms.get(idOrSlug);
      if (!form) {
        form = Array.from(memoryStore.forms.values()).find((f) => f.slug === idOrSlug || f._id === idOrSlug);
      }
      if (!form) {
        throw new NotFoundError(`Form '${idOrSlug}' not found`);
      }
      return form;
    }
  }

  /**
   * Update Form (by Organization owner or Super Admin)
   */
  public async updateForm(
    formId: string,
    input: Partial<CreateFormDto>,
    user: { _id: string; role: any; organizationId?: string | null }
  ) {
    const isDb = memoryStore.isDbConnected();
    const existing = await this.getFormByIdOrSlug(formId);

    // Permission check
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'CPET_ADMIN') {
      if (existing.organizationId && existing.organizationId.toString() !== user.organizationId?.toString()) {
        throw new ForbiddenError('Tenant violation: You cannot modify forms belonging to another organization');
      }
    }

    if (isDb) {
      const updateData: any = { ...input, updatedAt: new Date() };
      if (input.fields) {
        updateData.fields = input.fields.map((f, idx) => ({
          id: f.id || `f-${Date.now()}-${idx}`,
          name: f.name || `field_${idx}`,
          label: f.label || `Field ${idx + 1}`,
          type: f.type || 'text',
          placeholder: f.placeholder || '',
          helpText: f.helpText || '',
          required: !!f.required,
          options: f.options || [],
          defaultValue: f.defaultValue,
          order: f.order ?? idx,
        }));
      }

      const updated = await FormModel.findByIdAndUpdate(existing._id.toString(), { $set: updateData }, { new: true }).lean();
      return updated;
    } else {
      const current = memoryStore.forms.get(existing._id.toString());
      if (!current) throw new NotFoundError('Form not found in store');

      if (input.title) current.title = input.title;
      if (input.description !== undefined) current.description = input.description;
      if (input.category) current.category = input.category;
      if (input.department !== undefined) current.department = input.department;
      if (input.isPublic !== undefined) current.isPublic = input.isPublic;
      if (input.status) current.status = input.status;
      if (input.slaHours) current.slaHours = input.slaHours;
      if (input.priority) current.priority = input.priority;
      if (input.submitButtonText) current.submitButtonText = input.submitButtonText;
      if (input.successMessage) current.successMessage = input.successMessage;
      if (input.fields) {
        current.fields = input.fields.map((f, idx) => ({
          id: f.id || `f-${Date.now()}-${idx}`,
          name: f.name || `field_${idx}`,
          label: f.label || `Field ${idx + 1}`,
          type: f.type || 'text',
          placeholder: f.placeholder || '',
          helpText: f.helpText || '',
          required: !!f.required,
          options: f.options || [],
          defaultValue: f.defaultValue,
          order: f.order ?? idx,
        }));
      }
      current.updatedAt = new Date();
      memoryStore.forms.set(existing._id.toString(), current);
      return current;
    }
  }

  /**
   * Delete / Archive Form
   */
  public async deleteForm(
    formId: string,
    user: { _id: string; role: any; organizationId?: string | null }
  ) {
    const existing = await this.getFormByIdOrSlug(formId);
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'CPET_ADMIN') {
      if (existing.organizationId && existing.organizationId.toString() !== user.organizationId?.toString()) {
        throw new ForbiddenError('Tenant violation: You cannot delete forms of another organization');
      }
    }

    const isDb = memoryStore.isDbConnected();
    if (isDb) {
      await FormModel.findByIdAndUpdate(existing._id.toString(), { $set: { status: 'ARCHIVED' } });
    } else {
      const current = memoryStore.forms.get(existing._id.toString());
      if (current) {
        current.status = 'ARCHIVED';
        current.updatedAt = new Date();
      }
    }
    return { success: true, message: 'Form archived successfully', formId: existing._id.toString() };
  }

  /**
   * Submit Form (Citizen logged-in or Public unauthenticated guest)
   */
  public async submitForm(
    formId: string,
    input: SubmitFormDto,
    user?: { _id: string; name: string; email: string; phone?: string; role?: any }
  ) {
    const form = await this.getFormByIdOrSlug(formId);
    if (form.status === 'ARCHIVED') {
      throw new ValidationError('This form is archived and no longer accepting submissions.');
    }

    const isDb = memoryStore.isDbConnected();
    const referenceNumber = this.generateReferenceNumber();

    // Requester info
    const citizenId = user?._id || new Types.ObjectId().toString();
    const citizenName = user?.name || input.citizenInfo?.name || 'Public Citizen';
    const citizenEmail = user?.email || input.citizenInfo?.email || 'citizen@cpet.org';
    const citizenPhone = user?.phone || input.citizenInfo?.phone || '+91 94940 12345';

    // Organization resolution
    let targetOrgId = form.organizationId ? form.organizationId.toString() : null;
    let targetOrgName = form.organizationName || 'Public Authority';

    if (!targetOrgId) {
      // Find fallback active organization
      if (isDb) {
        const org = await OrganizationModel.findOne({ status: 'VERIFIED', active: true }).lean();
        if (org) {
          targetOrgId = org._id.toString();
          targetOrgName = org.name;
        } else {
          targetOrgId = '66d000000000000000000010';
        }
      } else {
        const firstOrg = Array.from(memoryStore.organizations.values())[0];
        targetOrgId = firstOrg?._id || '66d000000000000000000010';
        targetOrgName = firstOrg?.name || 'Apex Power & Water';
      }
    }

    const slaHours = form.slaHours || 48;
    const priority = (form.priority as CasePriority) || 'MEDIUM';
    const dueAt = new Date(Date.now() + slaHours * 3600 * 1000);

    // Build structured submission case
    const description =
      input.answers.description ||
      input.answers.complaintSummary ||
      input.answers.faultType ||
      input.answers.symptom ||
      `Form Submission: ${form.title}`;

    const structuredData = {
      formId: form._id.toString(),
      formTitle: form.title,
      formCategory: form.category,
      department: form.department || 'Direct Queue',
      submittedVia: user ? 'CITIZEN_PORTAL' : 'PUBLIC_ONLINE_FORM',
      ...input.answers,
    };

    const locationData = input.location || {
      address: input.answers.locationAddress || input.answers.siteAddress || input.answers.locality || 'Citizen Registered Location',
      city: 'Metro City',
      state: 'State',
      pincode: '500001',
    };

    if (isDb) {
      const newCase = await CaseModel.create({
        referenceNumber,
        type: 'SERVICE_REQUEST',
        title: `${form.title} — ${citizenName}`,
        description,
        category: form.category || 'Public Services',
        subcategory: form.department || 'Online Form',
        structuredData,
        location: locationData,
        requesterId: new Types.ObjectId(citizenId),
        requesterName: citizenName,
        requesterEmail: citizenEmail,
        requesterPhone: citizenPhone,
        organizationId: new Types.ObjectId(targetOrgId),
        organizationName: targetOrgName,
        assignedAgentId: null,
        priority,
        status: 'SUBMITTED',
        attachments: (input.attachments || []).map((att) => ({
          name: att.name,
          url: att.url,
          fileType: att.type,
          size: att.size || 1024,
          uploadedAt: new Date(),
        })),
        sla: {
          dueAt,
          slaHours,
          acknowledgementDueAt: new Date(Date.now() + 4 * 3600 * 1000),
          firstResponseDueAt: new Date(Date.now() + 8 * 3600 * 1000),
          resolutionDueAt: dueAt,
          status: 'ON_TRACK',
          isEscalated: false,
          escalationHistory: [],
        },
        version: 1,
        submittedAt: new Date(),
      });

      // Increment form submission count
      await FormModel.findByIdAndUpdate(form._id.toString(), { $inc: { submissionsCount: 1 } });

      // Create initial audit event
      const auditEvent = await CaseEventModel.create({
        caseId: newCase._id,
        actorId: new Types.ObjectId(citizenId),
        actorName: citizenName,
        actorRole: user?.role || 'CITIZEN',
        eventType: 'CASE_CREATED',
        previousState: null,
        newState: 'SUBMITTED',
        message: `Form '${form.title}' submitted by ${citizenName}. Reference: ${referenceNumber}`,
        isInternal: false,
        timestamp: new Date(),
      });

      // Notification for Organization
      try {
        await NotificationModel.create({
          recipientOrgId: new Types.ObjectId(targetOrgId),
          caseId: newCase._id,
          type: 'CASE_ASSIGNED',
          title: `New Form Submission: ${form.title}`,
          message: `${citizenName} submitted '${form.title}' (Ref: ${referenceNumber}). SLA: ${slaHours}h.`,
          isRead: false,
        });
      } catch (notifErr: any) {
        logger.warn(`[FormsService] Notification note: ${notifErr.message}`);
      }

      // Real-time socket broadcast to Organization Room
      socketManager.emitToOrg(targetOrgId, 'org:new_case', newCase.toObject());
      socketManager.emitToOrg(targetOrgId, 'notification:new', {
        caseId: newCase._id.toString(),
        title: `New Form Submission: ${form.title}`,
        message: `${citizenName} submitted '${form.title}' (${referenceNumber})`,
      });

      // SMS Dispatch to Citizen
      await smsNotificationService.dispatchStatusChangeSms({
        caseId: newCase._id.toString(),
        referenceNumber,
        recipientPhone: citizenPhone,
        recipientName: citizenName,
        requesterId: citizenId,
        newStatus: 'SUBMITTED',
        orgName: targetOrgName,
        actionSummary: `Form '${form.title}' received. Processing by ${targetOrgName}.`,
      });

      return {
        success: true,
        referenceNumber,
        caseId: newCase._id.toString(),
        formTitle: form.title,
        organizationName: targetOrgName,
        status: 'SUBMITTED',
        message: form.successMessage || 'Form submitted successfully!',
        case: newCase.toObject(),
        event: auditEvent.toObject(),
      };
    } else {
      const caseId = `case-${Date.now()}`;
      const newCase: MemoryCase = {
        _id: caseId,
        referenceNumber,
        type: 'SERVICE_REQUEST',
        title: `${form.title} — ${citizenName}`,
        description,
        category: form.category || 'Public Services',
        subcategory: form.department || 'Online Form',
        structuredData,
        location: locationData as any,
        requesterId: citizenId,
        requesterName: citizenName,
        requesterEmail: citizenEmail,
        requesterPhone: citizenPhone,
        organizationId: targetOrgId,
        organizationName: targetOrgName,
        assignedAgentId: null,
        priority,
        status: 'SUBMITTED',
        attachments: (input.attachments || []).map((att) => ({
          name: att.name,
          url: att.url,
          fileType: att.type,
          size: att.size || 1024,
          uploadedAt: new Date(),
        })),
        sla: {
          dueAt,
          slaHours,
          acknowledgementDueAt: new Date(Date.now() + 4 * 3600 * 1000),
          firstResponseDueAt: new Date(Date.now() + 8 * 3600 * 1000),
          resolutionDueAt: dueAt,
          status: 'ON_TRACK',
          isEscalated: false,
          escalationHistory: [],
        },
        version: 1,
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.cases.set(caseId, newCase);

      // Increment form count
      const memForm = memoryStore.forms.get(form._id.toString());
      if (memForm) {
        memForm.submissionsCount = (memForm.submissionsCount || 0) + 1;
        memForm.updatedAt = new Date();
      }

      const event: MemoryCaseEvent = {
        _id: `ev-${Date.now()}`,
        caseId,
        actorId: citizenId,
        actorName: citizenName,
        actorRole: user?.role || 'CITIZEN',
        eventType: 'CASE_CREATED',
        previousState: null,
        newState: 'SUBMITTED',
        message: `Form '${form.title}' submitted by ${citizenName}. Reference: ${referenceNumber}`,
        isInternal: false,
        timestamp: new Date(),
      };

      memoryStore.caseEvents.set(caseId, [event]);

      // Notification
      const notifId = `notif-${Date.now()}`;
      memoryStore.notifications.set(notifId, {
        _id: notifId,
        recipientOrgId: targetOrgId,
        caseId,
        type: 'CASE_ASSIGNED',
        title: `New Form Submission: ${form.title}`,
        message: `${citizenName} submitted '${form.title}' (Ref: ${referenceNumber}). SLA: ${slaHours}h.`,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Real-time socket broadcast
      socketManager.emitToOrg(targetOrgId, 'org:new_case', newCase);
      socketManager.emitToOrg(targetOrgId, 'notification:new', {
        caseId,
        title: `New Form Submission: ${form.title}`,
        message: `${citizenName} submitted '${form.title}' (${referenceNumber})`,
      });

      // SMS Dispatch
      await smsNotificationService.dispatchStatusChangeSms({
        caseId,
        referenceNumber,
        recipientPhone: citizenPhone,
        recipientName: citizenName,
        requesterId: citizenId,
        newStatus: 'SUBMITTED',
        orgName: targetOrgName,
        actionSummary: `Form '${form.title}' received. Processing by ${targetOrgName}.`,
      });

      return {
        success: true,
        referenceNumber,
        caseId,
        formTitle: form.title,
        organizationName: targetOrgName,
        status: 'SUBMITTED',
        message: form.successMessage || 'Form submitted successfully!',
        case: newCase,
        event,
      };
    }
  }

  /**
   * Get all submissions for a specific Form
   */
  public async getFormSubmissions(
    formId: string,
    user: { _id: string; role: any; organizationId?: string | null }
  ) {
    const form = await this.getFormByIdOrSlug(formId);

    // Tenancy authorization
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'CPET_ADMIN') {
      if (form.organizationId && form.organizationId.toString() !== user.organizationId?.toString()) {
        throw new ForbiddenError('Tenant violation: Cannot view submissions of another organization');
      }
    }

    const isDb = memoryStore.isDbConnected();
    if (isDb) {
      const submissions = await CaseModel.find({ 'structuredData.formId': form._id.toString() })
        .populate('requesterId', 'name email phone')
        .sort({ submittedAt: -1 })
        .lean();
      return submissions;
    } else {
      const allCases = Array.from(memoryStore.cases.values());
      const formSubmissions = allCases.filter(
        (c) => c.structuredData?.formId === form._id.toString()
      );
      return formSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
  }
}

export const formsService = new FormsService();
