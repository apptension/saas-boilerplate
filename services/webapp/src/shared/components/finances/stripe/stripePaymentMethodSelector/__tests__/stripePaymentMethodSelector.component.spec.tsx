import { Elements } from '@stripe/react-stripe-js';
import { screen, act } from '@testing-library/react';
import { createMockEnvironment, MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import { render } from '../../../../../../tests/utils/rendering';
import { connectionFromArray, matchTextContent } from '../../../../../utils/testUtils';
import { useApiForm } from '../../../../../hooks/useApiForm';
import { paymentMethodFactory } from '../../../../../../mocks/factories';
import { StripePaymentMethodSelector } from '../stripePaymentMethodSelector.component';
import { PaymentFormFields } from '../stripePaymentMethodSelector.types';
import { fillCommonQueryWithUser } from '../../../../../utils/commonQuery';
import { StripePaymentMethod } from '../../../../../services/api/stripe/paymentMethod';

const getRelayEnv = () => {
  const relayEnvironment = createMockEnvironment();
  fillCommonQueryWithUser(relayEnvironment);
  return relayEnvironment;
};

const resolvePaymentMethodsQuery = (
  relayEnvironment: RelayMockEnvironment,
  paymentMethods: StripePaymentMethod[] = []
) => {
  relayEnvironment.mock.resolveMostRecentOperation((operation) => {
    return MockPayloadGenerator.generate(operation, {
      PaymentMethodConnection: () => connectionFromArray(paymentMethods),
    });
  });
};

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

describe('StripePaymentMethodSelector: Component', () => {
  describe('there are payment methods available already', () => {
    it('should list possible payment methods', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });

      await act(() => {
        resolvePaymentMethodsQuery(relayEnvironment, paymentMethods);
      });

      expect(screen.getByText(matchTextContent('First Owner Visa **** 1234'))).toBeInTheDocument();
      expect(screen.getByText(matchTextContent('Second Owner Visa **** 9999'))).toBeInTheDocument();
    });

    it('should show add new method button', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });

      await act(() => {
        resolvePaymentMethodsQuery(relayEnvironment, paymentMethods);
      });
      expect(screen.getByText(/add a new card/i)).toBeInTheDocument();
    });
  });

  describe('there are no saved payment methods', () => {
    it('should not list possible payment methods', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });

      await act(() => {
        resolvePaymentMethodsQuery(relayEnvironment);
      });
      expect(screen.queryByText(matchTextContent('First Owner Visa **** 1234'))).not.toBeInTheDocument();
      expect(screen.queryByText(matchTextContent('Second Owner Visa **** 9999'))).not.toBeInTheDocument();
    });

    it('should not show add new method button', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });

      await act(() => {
        resolvePaymentMethodsQuery(relayEnvironment);
      });
      expect(screen.queryByText(/add a new card/i)).not.toBeInTheDocument();
    });
  });
});
