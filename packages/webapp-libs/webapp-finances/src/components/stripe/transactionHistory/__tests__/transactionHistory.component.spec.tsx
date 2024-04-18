import { Subscription } from '@sb/webapp-api-client/api/subscription/types';
import {
  currentUserFactory,
  fillCommonQueryWithUser,
  paymentMethodFactory,
  transactionHistoryEntryFactory,
} from '@sb/webapp-api-client/tests/factories';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { screen } from '@testing-library/react';

import { fillAllPaymentsMethodsQuery, fillAllStripeChargesQuery } from '../../../../tests/factories';
import { render } from '../../../../tests/utils/rendering';
import { TransactionHistory } from '../transactionHistory.component';

const Component = () => <TransactionHistory />;

describe('TransactionHistory: Component', () => {
  const paymentMethods = [
    paymentMethodFactory({ billingDetails: { name: 'Owner 1' }, card: { last4: '1234' } }),
    paymentMethodFactory({ billingDetails: { name: 'Owner 2' }, card: { last4: '9876' } }),
  ];

  const transactionHistory = [
    transactionHistoryEntryFactory({
      created: new Date(2020, 5, 5).toString(),
      amount: 50,
      paymentMethod: paymentMethods[0],
    }),
    transactionHistoryEntryFactory({
      created: new Date(2020, 10, 10).toString(),
      amount: 100,
      paymentMethod: paymentMethods[1],
    }),
  ];

  it('should render all items', async () => {
    const tenantId = 'tenantId';
    const tenantMock = fillCommonQueryWithUser(
      currentUserFactory({
        tenants: [
          tenantFactory({
            id: tenantId,
          }),
        ],
      })
    );
    const requestChargesMock = fillAllStripeChargesQuery(transactionHistory, tenantId);
    const requestPaymentsMock = fillAllPaymentsMethodsQuery(paymentMethods as Partial<Subscription>[], tenantId);
    render(<Component />, {
      apolloMocks: [requestChargesMock, requestPaymentsMock, tenantMock],
    });

    expect(await screen.findByText('Owner 1 Visa **** 1234')).toBeInTheDocument();
    expect(await screen.findByText('50 USD')).toBeInTheDocument();
    expect(screen.getByText('June 05, 2020')).toBeInTheDocument();

    expect(screen.getByText('Owner 2 Visa **** 9876')).toBeInTheDocument();
    expect(screen.getByText('100 USD')).toBeInTheDocument();
    expect(screen.getByText('June 05, 2020')).toBeInTheDocument();
  });
});
