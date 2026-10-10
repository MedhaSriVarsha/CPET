import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { NotificationModel } from '@cpet/database';
import { memoryStore } from '../../infrastructure/store.js';
import { smsNotificationService } from './sms.service.js';

export class NotificationController {
  /**
   * GET /api/v1/notifications
   * Returns notifications and SMS history for current authenticated citizen or org.
   */
  public async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const isDb = memoryStore.isDbConnected();

      let notifications: any[] = [];
      if (isDb && user?._id && Types.ObjectId.isValid(user._id)) {
        notifications = await NotificationModel.find({
          $or: [
            { recipientUserId: new Types.ObjectId(user._id) },
            ...(user.organizationId ? [{ recipientOrgId: new Types.ObjectId(user.organizationId) }] : []),
          ],
        })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
      } else {
        const userIdStr = user?._id?.toString();
        const orgIdStr = user?.organizationId?.toString();
        notifications = Array.from(memoryStore.notifications.values())
          .filter((n) => {
            if (userIdStr && n.recipientUserId === userIdStr) return true;
            if (orgIdStr && n.recipientOrgId === orgIdStr) return true;
            return false;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 50);
      }

      const smsLogs = smsNotificationService.getSmsLogs().slice(0, 20);

      res.status(200).json({
        success: true,
        data: {
          notifications,
          smsLogs,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Mark notification as read.
   */
  public async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isDb = memoryStore.isDbConnected();

      if (isDb && Types.ObjectId.isValid(id)) {
        await NotificationModel.findByIdAndUpdate(id, {
          isRead: true,
          readAt: new Date(),
        });
      } else {
        const notif = memoryStore.notifications.get(id);
        if (notif) {
          notif.isRead = true;
          notif.readAt = new Date();
          memoryStore.notifications.set(id, notif);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/notifications/test-sms
   * Dispatches a test SMS alert to verify phone delivery.
   */
  public async testSmsDispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, caseReference, status, orgName } = req.body;
      const user = (req as any).user;

      const result = await smsNotificationService.dispatchStatusChangeSms({
        caseId: 'test-case-id',
        referenceNumber: caseReference || 'CPET-2026-44537',
        recipientPhone: phone || user?.phone || '+91 94940 12345',
        recipientName: user?.name || 'Citizen',
        requesterId: user?._id,
        newStatus: status || 'IN_PROGRESS',
        orgName: orgName || 'UGC Anti-Ragging National Monitoring Cell',
        actionSummary: 'Assigned to Division Nodal Officer',
      });

      res.status(200).json({
        success: true,
        message: `SMS dispatched to ${result.phone}`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
