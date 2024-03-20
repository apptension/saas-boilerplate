import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { TabsContent } from '@sb/webapp-core/components/tabs';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../config/routes';
import { useGenerateTenantPath } from '../../../hooks';

export const TenantGeneralSettings = () => {
  const generateTenantPath = useGenerateTenantPath();

  return (
    <TabsContent value={generateTenantPath(RoutesConfig.tenant.settings.general)}>
      <div className="space-y-6 pt-4">
        <PageHeadline
          header={<FormattedMessage defaultMessage="General" id="Tenant General Settings / Header" />}
          subheader={
            <FormattedMessage
              defaultMessage="View and manage organization general settings"
              id="Tenant General Settings / General subheader"
            />
          }
        />
        <div>TODO: General settings here</div>
      </div>
    </TabsContent>
  );
};
