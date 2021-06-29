import { screen } from '@testing-library/react';
import { paymentMethodFactory } from '../../../../../../mocks/factories';
import { StripePaymentMethodCardBrand } from '../../../../../services/api/stripe/paymentMethod';
import { StripePaymentMethodInfo, StripePaymentMethodInfoProps } from '../stripePaymentMethodInfo.component';
import { makeContextRenderer, matchTextContent } from '../../../../../utils/testUtils';

describe('StripePaymentMethodInfo: Component', () => {
  const defaultProps: StripePaymentMethodInfoProps = {
    method: paymentMethodFactory({
      billingDetails: {
        name: 'Owner',
      },
      card: {
        last4: '1234',
        brand: StripePaymentMethodCardBrand.Visa,
      },
    }),
  };

  const component = (props: Partial<StripePaymentMethodInfoProps>) => (
    <StripePaymentMethodInfo {...defaultProps} {...props} />
  );
  const render = makeContextRenderer(component);

  it('should render all info', () => {
    render();
    expect(screen.getByText(matchTextContent('Owner Visa **** 1234'))).toBeInTheDocument();
  });

  describe('method is not specified', () => {
    it('should render "None" string', () => {
      render({ method: null });
      expect(screen.queryByText(matchTextContent('Owner Visa **** 1234'))).not.toBeInTheDocument();
      expect(screen.getByText('None'));
    });
  });
});
