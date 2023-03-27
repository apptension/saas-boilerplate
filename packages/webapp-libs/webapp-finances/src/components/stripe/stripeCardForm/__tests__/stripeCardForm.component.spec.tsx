import { action } from '@storybook/addon-actions';
import { Elements } from '@stripe/react-stripe-js';

import { render } from '../../../../tests/utils/rendering';
import { StripeCardForm, StripeCardFormProps } from '../stripeCardForm.component';

describe('StripeCardForm: Component', () => {
  const defaultProps: StripeCardFormProps = {
    onChange: action('onChange'),
  };

  const Component = (props: Partial<StripeCardFormProps>) => (
    <Elements stripe={null}>
      <StripeCardForm {...defaultProps} {...props} />
    </Elements>
  );

  it('should render without errors', () => {
    render(<Component />);
  });
});
