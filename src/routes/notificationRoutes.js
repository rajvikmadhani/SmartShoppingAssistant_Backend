import { Router } from 'express';
import {
    getAllNotifications,
    createNotification,
    markNotificationAsRead,
} from '../controllers/notificationController.js';
import validateSchema from '../middleware/validateSchema.js';
import notificationSchema from '../schemas/notificationSchema.js';

const notificationRouter = Router();
notificationRouter.get('/', getAllNotifications);
notificationRouter.post('/', validateSchema(notificationSchema), createNotification);
notificationRouter.put('/:id/read', markNotificationAsRead);
export default notificationRouter;
