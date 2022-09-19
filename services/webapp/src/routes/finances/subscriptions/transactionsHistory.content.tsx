import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { FormattedMessage } from 'react-intl';

import StripeAllChargesQueryGraphql, {
  stripeAllChargesQuery,
} from '../../../modules/stripe/__generated__/stripeAllChargesQuery.graphql';
import { RoutesConfig } from '../../../app/config/routes';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { Link, Row } from './subscriptions.styles';

export type TransactionHistoryContentProps = {
  transactionHistoryQueryRef: PreloadedQuery<stripeAllChargesQuery>;
};

export const TransactionsHistoryContent = ({ transactionHistoryQueryRef }: TransactionHistoryContentProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const data = usePreloadedQuery(StripeAllChargesQueryGraphql, transactionHistoryQueryRef);

  const length = data.allCharges?.edges?.length ?? 0;
  return length > 0 ? (
    <Link to={generateLocalePath(RoutesConfig.finances.history)}>
      <FormattedMessage defaultMessage="View transaction history" id="My subscription / View history button" />
    </Link>
  ) : (
    <Row>
      <FormattedMessage
        defaultMessage="You don't have any history to show"
        id="My subscription / No transaction history"
      />
    </Row>
  );
};
