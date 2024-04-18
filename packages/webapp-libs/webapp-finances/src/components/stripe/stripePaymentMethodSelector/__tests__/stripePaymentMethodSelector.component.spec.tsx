import { useApiForm } from '@sb/webapp-api-client/hooks';
import {
  currentUserFactory,
  fillCommonQueryWithUser,
  paymentMethodFactory,
  subscriptionPhaseFactory,
} from '@sb/webapp-api-client/tests/factories';
import { Form } from '@sb/webapp-core/components/forms';
import { matchTextContent } from '@sb/webapp-core/tests/utils/match';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { Elements } from '@stripe/react-stripe-js';
import { screen } from '@testing-library/react';

import { StripePaymentMethodSelector } from '../';
import { fillSubscriptionScheduleQueryWithPhases } from '../../../../tests/factories';
import { render } from '../../../../tests/utils/rendering';
import { PaymentFormFields } from '../stripePaymentMethodSelector.types';

const StripePaymentMethodSelectorWithControls = () => {
  const formControls = useApiForm<PaymentFormFields>();
  return (
    <Form {...formControls.form}>
      <StripePaymentMethodSelector control={formControls.form.control} />
    </Form>
  );
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

const tenantId = 'tenantId';

describe('StripePaymentMethodSelector: Component', () => {
  describe('there are payment methods available already', () => {
    it('should list possible payment methods', async () => {
      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );
      const requestMock = fillSubscriptionScheduleQueryWithPhases(phases, paymentMethods, tenantId);
      const { waitForApolloMocks } = render(<Component />, { apolloMocks: [tenantMock, requestMock] });

      await waitForApolloMocks();

      expect(await screen.findByText(matchTextContent('First Owner Visa **** 1234'))).toBeInTheDocument();
      expect(screen.getByText(matchTextContent('Second Owner Visa **** 9999'))).toBeInTheDocument();
    });

    it('should show add new method button', async () => {
      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );
      const requestMock = fillSubscriptionScheduleQueryWithPhases(phases, paymentMethods);
      const { waitForApolloMocks } = render(<Component />, { apolloMocks: [tenantMock, requestMock] });

      await waitForApolloMocks();

      expect(await screen.findByText(/use a new card/i)).toBeInTheDocument();
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

      expect(screen.queryByText(/use a new card/i)).not.toBeInTheDocument();
    });
  });
});
