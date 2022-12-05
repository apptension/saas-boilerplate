import { Suspense } from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../../../../../tests/utils/rendering';
import {
  fillAllStripeChargesQuery,
  paymentMethodFactory,
  transactionHistoryEntryFactory,
} from '../../../../../../mocks/factories';
import { TransactionHistory } from '../transactionHistory.component';
import { useTransactionsHistoryQuery } from '../transactionHistory.hooks';
import { getRelayEnv } from '../../../../../../tests/utils/relay';

const Component = () => {
  const { transactionsHistoryQueryRef } = useTransactionsHistoryQuery();

  return transactionsHistoryQueryRef ? (
    <Suspense fallback={null}>
      <TransactionHistory transactionHistoryQueryRef={transactionsHistoryQueryRef} />;
    </Suspense>
  ) : null;
};
describe('TransactionHistory: Component', () => {
  const transactionHistory = [
    transactionHistoryEntryFactory({
      created: new Date(2020, 5, 5).toString(),
      amount: 50,
      paymentMethod: paymentMethodFactory({
        card: {
          last4: '1234',
        },
        billingDetails: {
          name: 'Owner 1',
        },
      }),
    }),
    transactionHistoryEntryFactory({
      created: new Date(2020, 10, 10).toString(),
      amount: 100,
      paymentMethod: paymentMethodFactory({
        card: {
          last4: '9876',
        },
        billingDetails: {
          name: 'Owner 2',
        },
      }),
    }),
  ];

  it('should render all items', async () => {
    const relayEnvironment = getRelayEnv();
    fillAllStripeChargesQuery(relayEnvironment, transactionHistory);
    render(<Component />, { relayEnvironment });

    expect(screen.getByText('Owner 1 Visa **** 1234')).toBeInTheDocument();
    expect(screen.getByText('50 USD')).toBeInTheDocument();
    expect(screen.getByText('June 05, 2020')).toBeInTheDocument();

    expect(screen.getByText('Owner 2 Visa **** 9876')).toBeInTheDocument();
    expect(screen.getByText('100 USD')).toBeInTheDocument();
    expect(screen.getByText('June 05, 2020')).toBeInTheDocument();
  });
});
