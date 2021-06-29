import { action } from '@storybook/addon-actions';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCardForm, StripeCardFormProps } from '../stripeCardForm.component';
import { makeContextRenderer } from '../../../../../utils/testUtils';

describe('StripeCardForm: Component', () => {
  const defaultProps: StripeCardFormProps = {
    onChange: action('onChange'),
  };

  const component = (props: Partial<StripeCardFormProps>) => (
    <Elements stripe={null}>
      <StripeCardForm {...defaultProps} {...props} />
    </Elements>
  );
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
