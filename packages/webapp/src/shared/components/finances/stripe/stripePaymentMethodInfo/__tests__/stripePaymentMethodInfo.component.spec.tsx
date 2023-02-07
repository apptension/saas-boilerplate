import { screen } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { append } from 'ramda';

import { fillAllPaymentsMethodsQuery, paymentMethodFactory } from '../../../../../../mocks/factories';
import { render } from '../../../../../../tests/utils/rendering';
import { StripePaymentMethodInfo, StripePaymentMethodInfoProps } from '../stripePaymentMethodInfo.component';
import { matchTextContent } from '../../../../../../tests/utils/match';
import { STRIPE_ALL_PAYMENTS_METHODS_QUERY } from '../../stripePaymentMethodSelector/stripePaymentMethodSelector.graphql';
import { mapConnection } from '../../../../../../shared/utils/graphql';
import { Subscription } from '../../../../../../shared/services/api/subscription/types';

const Component = (props: Partial<StripePaymentMethodInfoProps>) => {
  const { data } = useQuery(STRIPE_ALL_PAYMENTS_METHODS_QUERY, { nextFetchPolicy: 'cache-and-network' });

  const paymentMethods = mapConnection((plan) => plan, data?.allPaymentMethods);
  const firstPaymentMethod = paymentMethods?.[0];

  return <StripePaymentMethodInfo {...props} method={firstPaymentMethod} />;
};

describe('StripePaymentMethodInfo: Component', () => {
  const paymentMethods = [paymentMethodFactory()];

  it('should render all info', async () => {
    const requestMock = fillAllPaymentsMethodsQuery(paymentMethods as Partial<Subscription>[]);
    render(<Component />, { apolloMocks: append(requestMock) });
    expect(await screen.findByText(matchTextContent('MockLastName Visa **** 9999'))).toBeInTheDocument();
  });

  describe('method is not specified', () => {
    it('should render "None" string', async () => {
      render(<Component />);
      expect(await screen.findByText('None'));
    });
  });
});
