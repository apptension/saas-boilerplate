import { useQuery } from '@apollo/client';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../app/config/routes';
import { stripeAllChargesQuery } from './subscriptions.graphql';
import { Link, Row } from './subscriptions.styles';

export const TransactionsHistoryContent = () => {
  const generateLocalePath = useGenerateLocalePath();
  const { data } = useQuery(stripeAllChargesQuery);

  const length = data?.allCharges?.edges?.length ?? 0;

  if (!length)
    return (
      <Row>
        <FormattedMessage
          defaultMessage="You don't have any history to show"
          id="My subscription / No transaction history"
        />
      </Row>
    );

  return (
    <Link to={generateLocalePath(RoutesConfig.finances.history)}>
      <FormattedMessage defaultMessage="View transaction history" id="My subscription / View history button" />
    </Link>
  );
};
