import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { notificationController } from './notification.controller.js';

export const notificationRouter = Router();

// Retrieve notifications and SMS dispatch logs
notificationRouter.get('/', authenticate, notificationController.getNotifications);

// Mark notification as read
notificationRouter.patch('/:id/read', authenticate, notificationController.markAsRead);

// Send test SMS alert
notificationRouter.post('/test-sms', authenticate, notificationController.testSmsDispatch);

