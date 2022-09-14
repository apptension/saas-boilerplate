import { screen } from '@testing-library/react';
import { TransactionHistory } from '../transactionHistory.component';
import { makeContextRenderer } from '../../../../../utils/testUtils';
import { paymentMethodFactory, transactionHistoryEntryFactory } from '../../../../../../mocks/factories';

describe('TransactionHistory: Component', () => {
  const component = () => <TransactionHistory />;
  const render = makeContextRenderer(component, {
    store: (state) => {
      state.stripe.transactionHistory = [
        transactionHistoryEntryFactory({
          billingDetails: {
            name: 'Owner 1',
          },
          created: new Date(2020, 5, 5).toString(),
          amount: 50,
          paymentMethodDetails: paymentMethodFactory({
            card: {
              last4: '1234',
            },
          }),
        }),
        transactionHistoryEntryFactory({
          billingDetails: {
            name: 'Owner 2',
          },
          created: new Date(2020, 10, 10).toString(),
          amount: 100,
          paymentMethodDetails: paymentMethodFactory({
            card: {
              last4: '9876',
            },
          }),
        }),
      ];
    },
  });

  it('should render all items', () => {
    render();

    // todo: enable this when revrite transaction history
    // expect(screen.getByText('Owner 1 Visa **** 1234')).toBeInTheDocument();
    expect(screen.getByText('50 USD')).toBeInTheDocument();
    expect(screen.getByText('June 05, 2020')).toBeInTheDocument();

    // expect(screen.getByText('Owner 2 Visa **** 9876')).toBeInTheDocument();
    expect(screen.getByText('100 USD')).toBeInTheDocument();
    expect(screen.getByText('June 05, 2020')).toBeInTheDocument();
  });
});
