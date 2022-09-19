import { Elements } from '@stripe/react-stripe-js';
import { times } from 'ramda';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { act } from '@testing-library/react';
import { render } from '../../../../../../tests/utils/rendering';
import { paymentMethodFactory } from '../../../../../../mocks/factories';
import { fillCommonQueryWithUser } from '../../../../../utils/commonQuery';
import { StripePaymentForm, StripePaymentFormProps } from '../stripePaymentForm.component';
import { connectionFromArray } from '../../../../../utils/testUtils';

describe('StripePaymentForm: Component', () => {
  const defaultProps: StripePaymentFormProps = {
    onSuccess: jest.fn(),
  };

  const getRelayEnv = () => {
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
    return relayEnvironment;
  };

  const Component = (props: Partial<StripePaymentFormProps>) => (
    <Elements stripe={null}>
      <StripePaymentForm {...defaultProps} {...props} />
    </Elements>
  );

  it('should render without errors', async () => {
    const relayEnvironment = getRelayEnv();

    render(<Component />, {
      relayEnvironment,
    });

    await act(() => {
      relayEnvironment.mock.resolveMostRecentOperation((operation) => {
        return MockPayloadGenerator.generate(operation, {
          PaymentMethodConnection: () => connectionFromArray(times(() => paymentMethodFactory(), 2)),
        });
      });
    });
  });
});
