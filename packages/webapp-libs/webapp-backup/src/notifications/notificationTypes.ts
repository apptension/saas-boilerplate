/**
 * Backup notification type codes.
 * Defined locally in webapp-backup; shared NotificationTypes in webapp-notifications
 * do not include these to avoid coupling.
 */
export enum BackupNotificationTypes {
  BACKUP_READY = 'BACKUP_READY',
  BACKUP_FAILED = 'BACKUP_FAILED',
  RESTORE_COMPLETED = 'RESTORE_COMPLETED',
  RESTORE_FAILED = 'RESTORE_FAILED',
}
