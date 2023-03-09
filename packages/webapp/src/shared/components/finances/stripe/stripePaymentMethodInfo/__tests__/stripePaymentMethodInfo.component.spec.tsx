import { useQuery } from '@apollo/client';
import { screen } from '@testing-library/react';
import { append } from 'ramda';

import {
  fillSubscriptionScheduleQuery,
  fillSubscriptionScheduleQueryWithPhases,
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
} from '../../../../../../mocks/factories';
import { matchTextContent } from '../../../../../../tests/utils/match';
import { render } from '../../../../../../tests/utils/rendering';
import { mapConnection } from '../../../../../utils/graphql';
import { stripeSubscriptionQuery } from '../../stripePaymentMethodSelector/stripePaymentMethodSelector.graphql';
import { StripePaymentMethodInfo, StripePaymentMethodInfoProps } from '../stripePaymentMethodInfo.component';

const Component = (props: Partial<StripePaymentMethodInfoProps>) => {
  const { data } = useQuery(stripeSubscriptionQuery, { nextFetchPolicy: 'cache-and-network' });

  const paymentMethods = mapConnection((plan) => plan, data?.allPaymentMethods);
  const firstPaymentMethod = paymentMethods?.[0];

  return <StripePaymentMethodInfo {...props} method={firstPaymentMethod} />;
};

describe('StripePaymentMethodInfo: Component', () => {
  const paymentMethods = [paymentMethodFactory()];

  it('should render all info', async () => {
    const requestMock = fillSubscriptionScheduleQueryWithPhases([subscriptionPhaseFactory()], paymentMethods);

    render(<Component />, { apolloMocks: append(requestMock) });
    expect(await screen.findByText(matchTextContent('MockLastName Visa **** 9999'))).toBeInTheDocument();
  });

  describe('method is not specified', () => {
    it('should render "None" string', async () => {
      const requestMock = fillSubscriptionScheduleQuery(subscriptionFactory());

      render(<Component />, { apolloMocks: append(requestMock) });
      expect(await screen.findByText('None')).toBeInTheDocument();
    });
  });
});
