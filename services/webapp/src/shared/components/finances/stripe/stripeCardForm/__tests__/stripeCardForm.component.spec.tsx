import { action } from '@storybook/addon-actions';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCardForm, StripeCardFormProps } from '../stripeCardForm.component';
import { render } from '../../../../../../tests/utils/rendering';

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
