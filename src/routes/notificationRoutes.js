import { Router } from 'express';
import { getUserNotifications, markNotificationAsRead } from '../controllers/notificationController.js';

const notificationRouter = Router();
notificationRouter.get('/', getUserNotifications);
notificationRouter.put('/:id/read', markNotificationAsRead);
export default notificationRouter;
