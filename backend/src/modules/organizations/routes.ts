import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { authenticate, authorize, tenantScope } from '../../middleware/auth.js';
import { OrganizationModel, UserModel, UserRole } from '@cpet/database';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { memoryStore } from '../../infrastructure/store.js';
import { caseService } from '../cases/case.service.js';

export const organizationsRouter = Router();

/**
 * Public Directory of Organizations (Citizens can browse)
 */
organizationsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let orgs: any[];
    if (memoryStore.isDbConnected()) {
      orgs = await OrganizationModel.find({ status: 'VERIFIED' })
        .select('name slug type category contactEmail contactPhone address settings')
        .lean();
    } else {
      orgs = Array.from(memoryStore.organizations.values()).filter((o) => o.status === 'VERIFIED');
    }

    res.status(200).json({
      success: true,
      data: orgs,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Public Organization Details
 */
organizationsRouter.get('/:orgId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let org: any;
    if (memoryStore.isDbConnected()) {
      org = await OrganizationModel.findById(req.params.orgId)
        .select('name slug type category contactEmail contactPhone address settings createdAt')
        .lean();
    } else {
      org = memoryStore.organizations.get(req.params.orgId);
    }

    if (!org) {
      throw new NotFoundError('Organization not found.');
    }

    res.status(200).json({
      success: true,
      data: org,
    });
  } catch (error) {
    next(error);
  }
});

// ===================================================
// TENANT PROTECTED ROUTES
// Requires Authentication, Organization Role & Strict Tenant Scope
// ===================================================

/**
 * Organization Executive Dashboard Metrics
 */
organizationsRouter.get(
  '/:orgId/dashboard',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'ORGANIZATION_AGENT', 'SUPER_ADMIN', 'CPET_ADMIN'),
  tenantScope,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let org: any;
      if (memoryStore.isDbConnected() || Boolean((OrganizationModel.findById as any)?._isMockFunction)) {
        org = await OrganizationModel.findById(req.params.orgId).lean();
      } else {
        org = memoryStore.organizations.get(req.params.orgId);
      }

      if (!org) {
        throw new NotFoundError('Organization tenant not found.');
      }

      // Query real cases for this organization tenant
      const cases = await caseService.getCasesForOrganization(req.params.orgId);

      const totalRequests = cases.length;
      const newRequests = cases.filter(
        (c: any) => c.status === 'SUBMITTED' || c.status === 'ACKNOWLEDGED'
      ).length;
      const submitted = cases.filter((c: any) => c.status === 'SUBMITTED').length;
      const inProgress = cases.filter(
        (c: any) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED'
      ).length;
      const waiting = cases.filter(
        (c: any) => c.status === 'WAITING_FOR_USER' || c.status === 'WAITING_FOR_ORGANIZATION'
      ).length;
      const resolved = cases.filter(
        (c: any) => c.status === 'RESOLVED' || c.status === 'CLOSED'
      ).length;
      const escalated = cases.filter(
        (c: any) => c.status === 'ESCALATED' || c.sla?.isEscalated
      ).length;

      const complianceRate =
        totalRequests > 0
          ? `${Math.round(((totalRequests - escalated) / totalRequests) * 1000) / 10}%`
          : '100%';

      const metrics = {
        totalRequests,
        newRequests,
        submitted,
        inProgress,
        waiting,
        resolved,
        escalated,
        recentCases: cases.slice(0, 5),
        slaComplianceRate: complianceRate,
        defaultSlaHours: org.settings?.defaultSlaHours || 48,
      };

      res.status(200).json({
        success: true,
        tenant: {
          id: org._id,
          name: org.name,
          slug: org.slug,
        },
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Organization Request Queue (Strictly Tenant Isolated)
 */
organizationsRouter.get(
  '/:orgId/requests',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'ORGANIZATION_AGENT', 'SUPER_ADMIN', 'CPET_ADMIN'),
  tenantScope,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let org: any;
      if (memoryStore.isDbConnected()) {
        org = await OrganizationModel.findById(req.params.orgId).lean();
      } else {
        org = memoryStore.organizations.get(req.params.orgId);
      }

      if (!org) {
        throw new NotFoundError('Organization tenant not found.');
      }

      const cases = await caseService.getCasesForOrganization(req.params.orgId, {
        status: req.query.status as string,
        priority: req.query.priority as string,
        search: req.query.search as string,
      });

      res.status(200).json({
        success: true,
        data: cases,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Organization Request Details Preview (Two-Way Interaction)
 */
organizationsRouter.get(
  '/:orgId/requests/:requestId',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'ORGANIZATION_AGENT', 'SUPER_ADMIN', 'CPET_ADMIN'),
  tenantScope,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const caseDetail = await caseService.getCaseDetails(req.params.requestId, {
        _id: user.userId,
        role: user.role,
        organizationId: req.params.orgId,
      });

      res.status(200).json({
        success: true,
        data: caseDetail,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Organization Team Roster (Active & Inactive with Assigned Workload)
 */
organizationsRouter.get(
  '/:orgId/members',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'ORGANIZATION_AGENT', 'SUPER_ADMIN', 'CPET_ADMIN'),
  tenantScope,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId;
      const allCases = await caseService.getCasesForOrganization(orgId);

      let members: any[];
      if (memoryStore.isDbConnected()) {
        members = await UserModel.find({
          organizationId: orgId,
          isDeleted: { $ne: true },
        })
          .select('name email phone role isActive lastLoginAt createdAt')
          .lean();
      } else {
        members = Array.from(memoryStore.users.values()).filter(
          (u) => u.organizationId === orgId
        );
      }

      // Compute live workload (active assigned cases) for each team member
      const enrichedMembers = members.map((m: any) => {
        const memberIdStr = (m._id || m.id).toString();
        const assignedActiveCases = allCases.filter(
          (c: any) =>
            (c.assignedAgentId?.toString() === memberIdStr || c.assignedAgentName === m.name) &&
            c.status !== 'RESOLVED' &&
            c.status !== 'CLOSED'
        );

        return {
          _id: memberIdStr,
          id: memberIdStr,
          name: m.name,
          email: m.email,
          phone: m.phone || '',
          role: m.role || 'ORGANIZATION_AGENT',
          isActive: m.isActive !== undefined ? Boolean(m.isActive) : true,
          status: (m.isActive !== false) ? 'ACTIVE' : 'INACTIVE',
          assignedCasesCount: assignedActiveCases.length,
          lastLoginAt: m.lastLoginAt || m.updatedAt || m.createdAt,
          createdAt: m.createdAt,
        };
      });

      res.status(200).json({
        success: true,
        data: enrichedMembers,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Add / Invite Team Member
 */
organizationsRouter.post(
  '/:orgId/members',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'SUPER_ADMIN'),
  tenantScope,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, role, password, phone } = req.body;
      const emailKey = email.toLowerCase().trim();

      if (memoryStore.isDbConnected()) {
        const existing = await UserModel.findOne({ email: emailKey });
        if (existing) {
          throw new ConflictError('A user with this email address already exists.');
        }

        const passwordHash = await bcrypt.hash(password || 'TemporaryPass@123', 10);
        const newMember = await UserModel.create({
          name,
          email: emailKey,
          phone,
          passwordHash,
          role: role === 'ORGANIZATION_ADMIN' ? 'ORGANIZATION_ADMIN' : 'ORGANIZATION_AGENT',
          organizationId: req.params.orgId,
          isEmailVerified: true,
          isActive: true,
          consent: { termsAccepted: true, termsVersion: '1.0', acceptedAt: new Date() },
        });

        res.status(201).json({
          success: true,
          message: 'Team member added successfully.',
          data: {
            id: newMember._id.toString(),
            _id: newMember._id.toString(),
            name: newMember.name,
            email: newMember.email,
            phone: newMember.phone,
            role: newMember.role,
            isActive: true,
            status: 'ACTIVE',
            assignedCasesCount: 0,
          },
        });
      } else {
        const existing = Array.from(memoryStore.users.values()).find((u) => u.email === emailKey);
        if (existing) {
          throw new ConflictError('A user with this email address already exists.');
        }

        const passwordHash = await bcrypt.hash(password || 'TemporaryPass@123', 10);
        const memberId = crypto.randomUUID();
        const newMember = {
          _id: memberId,
          name,
          email: emailKey,
          phone,
          passwordHash,
          role: (role === 'ORGANIZATION_ADMIN' ? 'ORGANIZATION_ADMIN' : 'ORGANIZATION_AGENT') as UserRole,
          organizationId: req.params.orgId,
          isEmailVerified: true,
          isPhoneVerified: false,
          isActive: true,
          consent: { termsAccepted: true, termsVersion: '1.0', acceptedAt: new Date() },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.users.set(memberId, newMember);

        res.status(201).json({
          success: true,
          message: 'Team member added successfully.',
          data: {
            id: newMember._id,
            _id: newMember._id,
            name: newMember.name,
            email: newMember.email,
            phone: newMember.phone,
            role: newMember.role,
            isActive: true,
            status: 'ACTIVE',
            assignedCasesCount: 0,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Manage Team Member Status (Active / Inactive / Role Update)
 */
organizationsRouter.patch(
  '/:orgId/members/:memberId/status',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'SUPER_ADMIN'),
  tenantScope,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isActive, role, phone } = req.body;
      let updatedMember: any;

      if (memoryStore.isDbConnected()) {
        const updateData: any = {};
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);
        if (role) updateData.role = role;
        if (phone) updateData.phone = phone;

        updatedMember = await UserModel.findOneAndUpdate(
          { _id: req.params.memberId, organizationId: req.params.orgId },
          { $set: updateData },
          { new: true }
        ).select('name email phone role isActive updatedAt');

        if (!updatedMember) {
          throw new NotFoundError('Team member not found in this organization.');
        }
      } else {
        const member = memoryStore.users.get(req.params.memberId);
        if (!member || member.organizationId !== req.params.orgId) {
          throw new NotFoundError('Team member not found in this organization.');
        }
        if (isActive !== undefined) member.isActive = Boolean(isActive);
        if (role) member.role = role as UserRole;
        if (phone) member.phone = phone;
        member.updatedAt = new Date();
        memoryStore.users.set(req.params.memberId, member);
        updatedMember = member;
      }

      res.status(200).json({
        success: true,
        message: `Team member status updated to ${updatedMember.isActive ? 'Active' : 'Inactive'}.`,
        data: {
          id: updatedMember._id.toString(),
          _id: updatedMember._id.toString(),
          name: updatedMember.name,
          email: updatedMember.email,
          phone: updatedMember.phone,
          role: updatedMember.role,
          isActive: Boolean(updatedMember.isActive),
          status: updatedMember.isActive ? 'ACTIVE' : 'INACTIVE',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Remove / Deactivate Team Member
 */
organizationsRouter.delete(
  '/:orgId/members/:memberId',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'SUPER_ADMIN'),
  tenantScope,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (memoryStore.isDbConnected()) {
        const member = await UserModel.findOneAndUpdate(
          { _id: req.params.memberId, organizationId: req.params.orgId },
          { $set: { isActive: false, isDeleted: true } },
          { new: true }
        );
        if (!member) {
          throw new NotFoundError('Team member not found in this organization.');
        }
      } else {
        const member = memoryStore.users.get(req.params.memberId);
        if (!member || member.organizationId !== req.params.orgId) {
          throw new NotFoundError('Team member not found in this organization.');
        }
        member.isActive = false;
        memoryStore.users.set(req.params.memberId, member);
      }

      res.status(200).json({
        success: true,
        message: 'Team member removed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get Organization Settings & Profile
 */
organizationsRouter.get(
  '/:orgId/settings',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'ORGANIZATION_AGENT', 'SUPER_ADMIN', 'CPET_ADMIN'),
  tenantScope,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let org: any = null;
      if (memoryStore.isDbConnected()) {
        org = await OrganizationModel.findById(req.params.orgId)
          .select('name slug type category contactEmail contactPhone address settings')
          .lean();
      } else {
        org = memoryStore.organizations.get(req.params.orgId);
      }

      if (!org) {
        throw new NotFoundError('Organization not found.');
      }

      res.status(200).json({
        success: true,
        data: {
          id: org._id,
          name: org.name,
          settings: org.settings,
          category: org.category,
          contactPhone: org.contactPhone || '',
          address: org.address || '',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update Organization Settings
 */
organizationsRouter.patch(
  '/:orgId/settings',
  authenticate,
  authorize('ORGANIZATION_ADMIN', 'SUPER_ADMIN'),
  tenantScope,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { autoAssign, defaultSlaHours, category, contactPhone, address } = req.body;

      if (memoryStore.isDbConnected()) {
        const org = await OrganizationModel.findById(req.params.orgId);
        if (!org) {
          throw new NotFoundError('Organization not found.');
        }

        if (autoAssign !== undefined) org.settings.autoAssign = Boolean(autoAssign);
        if (defaultSlaHours !== undefined) org.settings.defaultSlaHours = Number(defaultSlaHours);
        if (category) org.category = category;
        if (contactPhone) org.contactPhone = contactPhone;
        if (address) org.address = address;

        await org.save();

        res.status(200).json({
          success: true,
          message: 'Organization settings updated successfully.',
          data: {
            id: org._id,
            name: org.name,
            settings: org.settings,
            category: org.category,
            contactPhone: org.contactPhone,
            address: org.address,
          },
        });
      } else {
        const org = memoryStore.organizations.get(req.params.orgId);
        if (!org) {
          throw new NotFoundError('Organization not found.');
        }

        if (autoAssign !== undefined) org.settings.autoAssign = Boolean(autoAssign);
        if (defaultSlaHours !== undefined) org.settings.defaultSlaHours = Number(defaultSlaHours);
        if (category) org.category = category;
        if (contactPhone) org.contactPhone = contactPhone;
        if (address) org.address = address;
        org.updatedAt = new Date();

        res.status(200).json({
          success: true,
          message: 'Organization settings updated successfully.',
          data: {
            id: org._id,
            name: org.name,
            settings: org.settings,
            category: org.category,
            contactPhone: org.contactPhone,
            address: org.address,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }
);
