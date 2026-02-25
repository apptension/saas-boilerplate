import { ElementType } from 'react';

import { BackupFailed } from './backupFailed';
import { BackupReady } from './backupReady';
import { RestoreCompleted } from './restoreCompleted';
import { RestoreFailed } from './restoreFailed';
import { BackupNotificationTypes } from './notificationTypes';

export const backupNotificationTemplates: Record<BackupNotificationTypes, ElementType> = {
  [BackupNotificationTypes.BACKUP_READY]: BackupReady,
  [BackupNotificationTypes.BACKUP_FAILED]: BackupFailed,
  [BackupNotificationTypes.RESTORE_COMPLETED]: RestoreCompleted,
  [BackupNotificationTypes.RESTORE_FAILED]: RestoreFailed,
};
