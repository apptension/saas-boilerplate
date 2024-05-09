import dangerIcon from '@iconify-icons/ion/alert-circle-outline';
import { TenantUserRole } from '@sb/webapp-api-client';
import { Icon } from '@sb/webapp-core/components/icons';
import { H3, Paragraph } from '@sb/webapp-core/components/typography';
import { FormattedMessage } from 'react-intl';

import { useCurrentTenant } from '../../providers';
import { TenantDeleteAlert } from '../tenantDeleteAlert';
import { useTenantDelete } from './tenantDangerZone.hook';

export const TenantDangerZone = () => {
  const { data: currentTenant } = useCurrentTenant();
  const isOwner = currentTenant?.membership.role === TenantUserRole.OWNER;

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

          <TenantDeleteAlert onContinue={deleteTenant} disabled={!isOwner || loading} />
        </div>
      </div>
    </div>
  );
};
