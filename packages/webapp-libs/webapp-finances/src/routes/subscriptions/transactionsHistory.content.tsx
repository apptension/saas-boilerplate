import { useQuery } from '@apollo/client';
import { Link } from '@sb/webapp-core/components/buttons';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { TabsContent } from '@sb/webapp-core/components/ui/tabs';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../config/routes';
import { stripeAllChargesQuery } from './subscriptions.graphql';

const TransactionsHistoryContent = () => {
  const { data: currentTenant } = useCurrentTenant();
  const generateTenantPath = useGenerateTenantPath();
  const { data } = useQuery(stripeAllChargesQuery, {
    variables: {
      tenantId: currentTenant?.id ?? '',
    },
    skip: !currentTenant,
  });

  const length = data?.allCharges?.edges?.length ?? 0;

  return (
    <TabsContent value={generateTenantPath(RoutesConfig.subscriptions.transactionHistory.index)}>
      <div className="space-y-6 pt-4">
        <PageHeadline
          header={<FormattedMessage defaultMessage="History" id="My subscription / History header" />}
          subheader={
            <FormattedMessage defaultMessage="View transaction history" id="My subscription / History subheader" />
          }
        />

        {!length ? (
          <div className="mt-1 text-muted-foreground text-sm">
            <FormattedMessage
              defaultMessage="You don't have any history to show"
              id="My subscription / No transaction history"
            />
          </div>
        ) : (
          <div>
            <Link to={generateTenantPath(RoutesConfig.subscriptions.transactionHistory.history)} variant="default">
              <FormattedMessage defaultMessage="View transaction history" id="My subscription / View history button" />
            </Link>
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default TransactionsHistoryContent;
