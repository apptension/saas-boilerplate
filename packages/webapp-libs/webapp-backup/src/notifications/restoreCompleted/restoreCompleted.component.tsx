import { Notification, NotificationType } from '@sb/webapp-notifications';
import { RotateCcw } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

export type RestoreCompletedProps = NotificationType<{
  restore_id: string;
  backup_id: string;
  tenant_name: string;
  status: string;
  total_created: number;
  total_updated: number;
  total_skipped: number;
  total_failed: number;
}>;

export const RestoreCompleted = ({
  data: { tenant_name, status, total_created, total_updated, total_skipped, total_failed },
  ...restProps
}: RestoreCompletedProps) => {
  const isPartiallyCompleted = status === 'PARTIALLY_COMPLETED';

  return (
    <Notification
      {...restProps}
      icon={<RotateCcw className="h-4 w-4 text-emerald-600" />}
      iconClassName="bg-emerald-100"
      title={
        <FormattedMessage
          defaultMessage={isPartiallyCompleted ? 'Restore Partially Completed' : 'Restore Completed'}
          id="Notifications / Restore Completed / Title"
        />
      }
      content={
        <>
          <FormattedMessage
            defaultMessage='Backup restoration for "{tenant_name}" has completed.'
            id="Notifications / Restore Completed / Content"
            values={{ tenant_name }}
          />
          <br />
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {total_created > 0 && (
              <div>
                <FormattedMessage
                  defaultMessage="{count, plural, one {# record created} other {# records created}}"
                  id="Notifications / Restore Completed / Created"
                  values={{ count: total_created }}
                />
              </div>
            )}
            {total_updated > 0 && (
              <div>
                <FormattedMessage
                  defaultMessage="{count, plural, one {# record updated} other {# records updated}}"
                  id="Notifications / Restore Completed / Updated"
                  values={{ count: total_updated }}
                />
              </div>
            )}
            {total_skipped > 0 && (
              <div>
                <FormattedMessage
                  defaultMessage="{count, plural, one {# record skipped} other {# records skipped}}"
                  id="Notifications / Restore Completed / Skipped"
                  values={{ count: total_skipped }}
                />
              </div>
            )}
            {total_failed > 0 && (
              <div className="text-destructive">
                <FormattedMessage
                  defaultMessage="{count, plural, one {# record failed} other {# records failed}}"
                  id="Notifications / Restore Completed / Failed"
                  values={{ count: total_failed }}
                />
              </div>
            )}
          </div>
          {isPartiallyCompleted && (
            <div className="mt-2 text-xs text-yellow-600">
              <FormattedMessage
                defaultMessage="Some records failed to restore. Check the restore history for details."
                id="Notifications / Restore Completed / Partial Warning"
              />
            </div>
          )}
        </>
      }
    />
  );
};
