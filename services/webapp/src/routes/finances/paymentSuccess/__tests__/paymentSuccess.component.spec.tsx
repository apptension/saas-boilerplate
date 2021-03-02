import React from 'react';

import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { PaymentSuccess } from '../paymentSuccess.component';

describe('PaymentSuccess: Component', () => {
  const component = () => <PaymentSuccess />;
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
