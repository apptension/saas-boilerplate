import { transactionHistoryEntryFactory } from '@sb/webapp-api-client/tests/factories';
import { composeMockedListQueryResult } from '@sb/webapp-api-client/tests/utils';
import { times } from 'ramda';

import { stripeAllChargesQuery } from '../../routes/subscriptions/subscriptions.graphql';

export const fillAllStripeChargesQuery = (
  data = times(() => transactionHistoryEntryFactory(), 5),
  tenantId = 'tenantId'
) => {
  return composeMockedListQueryResult(stripeAllChargesQuery, 'allCharges', 'StripeChargeType', {
    data,
    variables: {
      tenantId,
    },
  });
};
