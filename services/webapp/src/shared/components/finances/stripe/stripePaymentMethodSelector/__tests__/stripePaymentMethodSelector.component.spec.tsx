import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentMethodSelector } from '../stripePaymentMethodSelector.component';
import { makeContextRenderer, ProvidersWrapper } from '../../../../../utils/testUtils';
import { useApiForm } from '../../../../../hooks/useApiForm';
import { PaymentFormFields } from '../stripePaymentMethodSelector.types';

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

describe('StripePaymentMethodSelector: Component', () => {
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
