import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { screen } from '@testing-library/react';
import { StripePaymentMethodSelector } from '../stripePaymentMethodSelector.component';
import { makeContextRenderer, matchTextContent, ProvidersWrapper } from '../../../../../utils/testUtils';
import { useApiForm } from '../../../../../hooks/useApiForm';
import { PaymentFormFields } from '../stripePaymentMethodSelector.types';
import { prepareState } from '../../../../../../mocks/store';
import { paymentMethodFactory } from '../../../../../../mocks/factories';
import { useStripePaymentMethods } from '../../stripePayment.hooks';

const mockUseStripePaymentMethods = jest.fn();
jest.mock('../../stripePayment.hooks', () => ({ useStripePaymentMethods: () => mockUseStripePaymentMethods() }));

const StripePaymentMethodSelectorWithControls = () => {
  const formControls = useApiForm<PaymentFormFields>();
  return <StripePaymentMethodSelector formControls={formControls} />;
};

const component = () => {
  return (
    <Elements stripe={null}>
      <ProvidersWrapper>
        <StripePaymentMethodSelectorWithControls />
      </ProvidersWrapper>
    </Elements>
  );
};

const paymentMethods = [
  paymentMethodFactory({ billingDetails: { name: 'First Owner' }, card: { last4: '1234' } }),
  paymentMethodFactory({ billingDetails: { name: 'Second Owner' }, card: { last4: '9999' } }),
];

describe('StripePaymentMethodSelector: Component', () => {
  beforeEach(() => {
    mockUseStripePaymentMethods.mockReset();
  });

  const render = makeContextRenderer(component);

  describe('there are payment methods available already', () => {
    it('should list possible payment methods', () => {
      mockUseStripePaymentMethods.mockReturnValue({ isLoading: false, paymentMethods });

      render();
      expect(screen.getByText(matchTextContent('First Owner Visa **** 1234'))).toBeInTheDocument();
      expect(screen.getByText(matchTextContent('Second Owner Visa **** 9999'))).toBeInTheDocument();
    });

    it('should show add new method button', () => {
      mockUseStripePaymentMethods.mockReturnValue({ isLoading: false, paymentMethods });

      render();
      expect(screen.getByText(/add a new card/gi)).toBeInTheDocument();
    });
  });

  describe('there are no saved payment methods', () => {
    it('should not list possible payment methods', () => {
      mockUseStripePaymentMethods.mockReturnValue({ isLoading: false, paymentMethods: [] });

      render();
      expect(screen.queryByText(matchTextContent('First Owner Visa **** 1234'))).not.toBeInTheDocument();
      expect(screen.queryByText(matchTextContent('Second Owner Visa **** 9999'))).not.toBeInTheDocument();
    });

    it('should not show add new method button', () => {
      mockUseStripePaymentMethods.mockReturnValue({ isLoading: false, paymentMethods: [] });

      render();
      expect(screen.queryByText(/add a new card/gi)).not.toBeInTheDocument();
    });
  });
});
