import { TenantUserRole } from '@sb/webapp-api-client';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Button, buttonVariants } from '@sb/webapp-core/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { useCurrentTenantMembership } from '../../hooks';
import { useTenantDelete } from './tenantDangerZone.hook';

export const TenantDangerZone = () => {
  const { currentMembership } = useCurrentTenantMembership();
  const isOwner = currentMembership?.role === TenantUserRole.OWNER;

  const { deleteTenant, loading } = useTenantDelete();

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="text-lg font-semibold text-destructive">
          <FormattedMessage defaultMessage="Danger Zone" id="Tenant General Settings / Danger Zone / Header" />
        </h3>
      </div>

      <div className="rounded-lg border-2 border-destructive/50 bg-destructive/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="font-semibold text-foreground">
              <FormattedMessage
                defaultMessage="Delete this organization"
                id="Tenant General Settings / Danger Zone / Delete title"
              />
            </div>
            {!isOwner ? (
              <Paragraph className="text-sm text-muted-foreground">
                <FormattedMessage
                  defaultMessage="Only members with the Owner role can delete organization"
                  id="Tenant General Settings / Danger Zone / Delete owner role subtitle"
                />
              </Paragraph>
            ) : (
              <Paragraph className="text-sm text-muted-foreground">
                <FormattedMessage
                  defaultMessage="Once you delete an organization, there is no going back. Please be certain."
                  id="Tenant General Settings / Danger Zone / Delete warning"
                />
              </Paragraph>
            )}
          </div>

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
                defaultMessage="Delete organization"
                id="Tenant General Settings / Danger Zone / Tenant Delete Button"
              />
            </Button>
          </ConfirmDialog>
        </div>
      </div>
    </div>
  );
};
