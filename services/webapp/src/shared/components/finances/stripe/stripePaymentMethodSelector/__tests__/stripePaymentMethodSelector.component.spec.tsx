import React from 'react';
import { times } from 'ramda';

import {
  StripePaymentMethodSelector,
  StripePaymentMethodSelectorProps,
} from '../stripePaymentMethodSelector.component';
import { makeContextRenderer } from '../../../../../utils/testUtils';
import { paymentMethodFactory } from '../../../../../../mocks/factories/stripe';

describe('StripePaymentMethodSelector: Component', () => {
  const defaultProps: StripePaymentMethodSelectorProps = {
    name: 'paymentMethods',
    value: undefined,
    ref: {
      current: null,
    },
    paymentMethods: times(() => paymentMethodFactory(), 3),
    onChange: jest.fn(),
    onBlur: jest.fn(),
  };

  const component = (props: Partial<StripePaymentMethodSelectorProps>) => (
    <StripePaymentMethodSelector {...defaultProps} {...props} />
  );
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
