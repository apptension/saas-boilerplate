import { useQuery } from '@apollo/client';
import { Link } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../config/routes';
import { stripeAllChargesQuery } from './subscriptions.graphql';

export const TransactionsHistoryContent = () => {
  const generateLocalePath = useGenerateLocalePath();
  const { data } = useQuery(stripeAllChargesQuery);

  const length = data?.allCharges?.edges?.length ?? 0;

  if (!length)
    return (
      <div className="mt-1 text-muted-foreground text-sm">
        <FormattedMessage
          defaultMessage="You don't have any history to show"
          id="My subscription / No transaction history"
        />
      </div>
    );

  return (
    <Link to={generateLocalePath(RoutesConfig.finances.history)} variant="default">
      <FormattedMessage defaultMessage="View transaction history" id="My subscription / View history button" />
    </Link>
  );
};
