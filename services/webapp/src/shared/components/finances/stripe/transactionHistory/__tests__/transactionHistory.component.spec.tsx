import { screen } from '@testing-library/react';
import { TransactionHistory } from '../transactionHistory.component';
import { makeContextRenderer } from '../../../../../utils/testUtils';
import { prepareState } from '../../../../../../mocks/store';
import { paymentMethodFactory, transactionHistoryEntryFactory } from '../../../../../../mocks/factories';

const store = prepareState((state) => {
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
});

describe('TransactionHistory: Component', () => {
  const component = () => <TransactionHistory />;
  const render = makeContextRenderer(component);

  it('should render all items', () => {
    render({}, { store });

    expect(screen.getByText('Owner 1 Visa **** 1234')).toBeInTheDocument();
    expect(screen.getByText('50 USD')).toBeInTheDocument();
    expect(screen.getByText('June 05, 2020')).toBeInTheDocument();

    expect(screen.getByText('Owner 2 Visa **** 9876')).toBeInTheDocument();
    expect(screen.getByText('100 USD')).toBeInTheDocument();
    expect(screen.getByText('June 05, 2020')).toBeInTheDocument();
  });
});
