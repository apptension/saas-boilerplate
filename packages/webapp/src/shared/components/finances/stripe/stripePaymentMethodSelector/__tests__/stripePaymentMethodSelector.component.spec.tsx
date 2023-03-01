import { Elements } from '@stripe/react-stripe-js';
import { screen } from '@testing-library/react';
import { append } from 'ramda';

import {
  fillSubscriptionScheduleQueryWithPhases,
  paymentMethodFactory,
  subscriptionPhaseFactory,
} from '../../../../../../mocks/factories';
import { matchTextContent } from '../../../../../../tests/utils/match';
import { render } from '../../../../../../tests/utils/rendering';
import { useApiForm } from '../../../../../hooks/';
import { StripePaymentMethodSelector } from '../stripePaymentMethodSelector.component';
import { PaymentFormFields } from '../stripePaymentMethodSelector.types';

const StripePaymentMethodSelectorWithControls = () => {
  const formControls = useApiForm<PaymentFormFields>();
  return <StripePaymentMethodSelector formControls={formControls} />;
};

const Component = () => {
  return (
    <Elements stripe={null}>
      <StripePaymentMethodSelectorWithControls />
    </Elements>
  );
};

const paymentMethods = [
  paymentMethodFactory({ billingDetails: { name: 'First Owner' }, card: { last4: '1234' } }),
  paymentMethodFactory({ billingDetails: { name: 'Second Owner' }, card: { last4: '9999' } }),
];
const phases = [subscriptionPhaseFactory()];

describe('StripePaymentMethodSelector: Component', () => {
  describe('there are payment methods available already', () => {
    it('should list possible payment methods', async () => {
      const requestMock = fillSubscriptionScheduleQueryWithPhases(phases, paymentMethods);
      const { waitForApolloMocks } = render(<Component />, { apolloMocks: append(requestMock) });

      await waitForApolloMocks();

      expect(await screen.findByText(matchTextContent('First Owner Visa **** 1234'))).toBeInTheDocument();
      expect(screen.getByText(matchTextContent('Second Owner Visa **** 9999'))).toBeInTheDocument();
    });

    it('should show add new method button', async () => {
      const requestMock = fillSubscriptionScheduleQueryWithPhases(phases, paymentMethods);
      const { waitForApolloMocks } = render(<Component />, { apolloMocks: append(requestMock) });

      await waitForApolloMocks();

      expect(await screen.findByText(/add a new card/i)).toBeInTheDocument();
    });
  });

  describe('there are no saved payment methods', () => {
    it('should not list possible payment methods', async () => {
      render(<Component />);

      expect(screen.queryByText(matchTextContent('First Owner Visa **** 1234'))).not.toBeInTheDocument();
      expect(screen.queryByText(matchTextContent('Second Owner Visa **** 9999'))).not.toBeInTheDocument();
    });

    it('should not show add new method button', async () => {
      render(<Component />);

      expect(screen.queryByText(/add a new card/i)).not.toBeInTheDocument();
    });
  });
});
