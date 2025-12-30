import { useQuery } from '@apollo/client/react';
import { Link } from '@sb/webapp-core/components/buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { TabsContent } from '@sb/webapp-core/components/ui/tabs';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { History, Receipt } from 'lucide-react';
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <FormattedMessage defaultMessage="History" id="My subscription / History header" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage defaultMessage="View transaction history" id="My subscription / History subheader" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!length ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  <FormattedMessage defaultMessage="No transactions yet" id="My subscription / No transactions title" />
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  <FormattedMessage
                    defaultMessage="Your payment history will appear here once you make your first subscription purchase."
                    id="My subscription / No transaction history"
                  />
                </p>
              </div>
            ) : (
              <div>
                <Link to={generateTenantPath(RoutesConfig.subscriptions.transactionHistory.history)} variant="default">
                  <FormattedMessage
                    defaultMessage="View transaction history"
                    id="My subscription / View history button"
                  />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default TransactionsHistoryContent;
