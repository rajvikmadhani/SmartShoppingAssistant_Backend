import { checkAlertsAndEnqueueNotifications as _checkAlertsAndEnqueueNotifications } from './alertService.js';
import { mockCheckAlertsAndEnqueueNotifications } from './mockAlertService.js';
const isTestMode = process.env.alert_service_testMode === 'true';

export const checkAlertsAndEnqueueNotifications = isTestMode
    ? mockCheckAlertsAndEnqueueNotifications
    : checkAlertsAndEnqueueNotifications;
