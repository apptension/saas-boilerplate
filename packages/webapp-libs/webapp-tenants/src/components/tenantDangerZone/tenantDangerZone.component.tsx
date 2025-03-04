import dangerIcon from '@iconify-icons/ion/alert-circle-outline';
import { TenantUserRole } from '@sb/webapp-api-client';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { Icon } from '@sb/webapp-core/components/icons';
import { H3, Paragraph } from '@sb/webapp-core/components/typography';
import { Button, buttonVariants } from '@sb/webapp-core/components/ui/button';
import { FormattedMessage } from 'react-intl';

import { useCurrentTenantMembership } from '../../hooks';
import { useTenantDelete } from './tenantDangerZone.hook';

export const TenantDangerZone = () => {
  const { currentMembership } = useCurrentTenantMembership();
  const isOwner = currentMembership?.role === TenantUserRole.OWNER;

  const { deleteTenant, loading } = useTenantDelete();

  return (
    <div className="space-y-6 pt-4 mt-2">
      <div className="flex gap-2 items-center">
        <Icon className="text-red-500" icon={dangerIcon} />
        <H3 className="text-lg font-medium text-red-500">
          <FormattedMessage defaultMessage="Danger Zone" id="Tenant General Settings / Danger Zone / Header" />
        </H3>
      </div>

      <div className="p-4 border-red-500 border-2 rounded-md">
        <div className="flex justify-between">
          <span>
            <FormattedMessage
              defaultMessage="Delete this organization"
              id="Tenant General Settings / Danger Zone / Delete title"
            />

            <Paragraph className="text-sm text-slate-400">
              {isOwner ? undefined : (
                <FormattedMessage
                  defaultMessage="Only members with the Owner role can delete organization"
                  id="Tenant General Settings / Danger Zone / Delete owner role subtitle"
                />
              )}
            </Paragraph>
          </span>

          <ConfirmDialog
            onContinue={deleteTenant}
            variant="destructive"
            title={
              <FormattedMessage
                defaultMessage="Are you absolutely sure?"
                id="Tenant General Settings / Danger Zone / Confirm Dialog / Tenant Delete Button"
              />
            }
            description={
              <FormattedMessage
                defaultMessage="This action cannot be undone. This will permanently delete your organization from our servers."
                id="Tenant Danger Settings / Danger Zone / Confirm Dialog / Tenant Delete Description"
              />
            }
          >
            <Button disabled={!isOwner || loading} className={buttonVariants({ variant: 'destructive' })}>
              <FormattedMessage
                defaultMessage="Remove organization"
                id="Tenant General Settings / Danger Zone / Tenant Delete Button"
              />
            </Button>
          </ConfirmDialog>
        </div>
      </div>
    </div>
  );
};
