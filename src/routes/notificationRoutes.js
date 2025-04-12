import { Router } from 'express';
import {
    getUserNotifications,
    createNotification,
    markNotificationAsRead,
} from '../controllers/notificationController.js';
import validateSchema from '../middleware/validateSchema.js';
import notificationSchema from '../schemas/notificationSchema.js';

const notificationRouter = Router();
notificationRouter.get('/', getUserNotifications);
notificationRouter.post('/', validateSchema(notificationSchema), createNotification);
notificationRouter.put('/:id/read', markNotificationAsRead);
export default notificationRouter;
