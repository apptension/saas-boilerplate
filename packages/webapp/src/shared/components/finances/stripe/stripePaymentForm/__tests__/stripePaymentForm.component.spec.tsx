import { Elements } from '@stripe/react-stripe-js';
import userEvent from '@testing-library/user-event';
import { times } from 'ramda';
import { MockPayloadGenerator } from 'relay-test-utils';
import { screen, act } from '@testing-library/react';
import { render } from '../../../../../../tests/utils/rendering';
import { paymentMethodFactory } from '../../../../../../mocks/factories';
import { StripePaymentForm, StripePaymentFormProps } from '../stripePaymentForm.component';
import { getRelayEnv } from '../../../../../../tests/utils/relay';
import { TestProduct } from '../../../../../../modules/stripe/stripe.types';
import { connectionFromArray } from '../../../../../../tests/utils/fixtures';

const mockConfirmPayment = jest.fn();
jest.mock('../../stripePayment.hooks', () => {
  return {
    ...jest.requireActual<NodeModule>('../../stripePayment.hooks'),
    useStripePayment: () => ({ confirmPayment: mockConfirmPayment }),
  };
});

describe('StripePaymentForm: Component', () => {
  beforeEach(() => {
    mockConfirmPayment.mockClear();
  });
  const paymentMethods = times(() => paymentMethodFactory(), 2);

  const defaultProps: StripePaymentFormProps = {
    onSuccess: jest.fn(),
  };

  const Component = (props: Partial<StripePaymentFormProps>) => (
    <Elements stripe={null}>
      <StripePaymentForm {...defaultProps} {...props} />
    </Elements>
  );

  const selectProduct = (value = TestProduct.A) => userEvent.click(screen.getByRole('radio', { name: `${value} USD` }));
  const sendForm = () => userEvent.click(screen.getByRole('button', { name: /Pay \d+ USD/i }));

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

  describe('action completes successfully', () => {
    it('should call create payment intent mutation', async () => {
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

      await act(async () => {
        await selectProduct();
      });

      await act(async () => {
        await sendForm();
      });

      expect(relayEnvironment).toHaveLatestOperation('stripeCreatePaymentIntentMutation');
      expect(relayEnvironment).toLatestOperationInputEqual({ product: TestProduct.A });
    });

    it('should call confirm payment and onSuccess', async () => {
      const relayEnvironment = getRelayEnv();
      const paymentIntent = {
        amount: 5,
        clientSecret: 'client-test-secret',
        currency: 'USD',
        pk: 1,
      };
      mockConfirmPayment.mockReturnValue({ paymentIntent: { status: 'succeeded' } });
      const onSuccess = jest.fn();

      render(<Component onSuccess={onSuccess} />, {
        relayEnvironment,
      });
      await act(() => {
        relayEnvironment.mock.resolveMostRecentOperation((operation) => {
          return MockPayloadGenerator.generate(operation, {
            PaymentMethodConnection: () => connectionFromArray(paymentMethods),
          });
        });
      });

      await act(async () => {
        await selectProduct();
      });

      await act(async () => {
        await sendForm();
      });

      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(
          operation,
          MockPayloadGenerator.generate(operation, {
            StripePaymentIntentType: () => paymentIntent,
          })
        );
      });

      expect(mockConfirmPayment).toBeCalledWith({
        paymentMethod: expect.anything(),
        paymentIntent: expect.anything(),
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('when something goes wrong', () => {
    it('should show error message if creating payment intent throws error', async () => {
      const relayEnvironment = getRelayEnv();
      const onSuccess = jest.fn();

      render(<Component onSuccess={onSuccess} />, {
        relayEnvironment,
      });
      await act(() => {
        relayEnvironment.mock.resolveMostRecentOperation((operation) => {
          return MockPayloadGenerator.generate(operation, {
            PaymentMethodConnection: () => connectionFromArray(paymentMethods),
          });
        });
      });

      await act(async () => {
        await selectProduct();
      });

      await act(async () => {
        await sendForm();
      });

      const errorMessage = 'Something went wrong';

      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, {
          ...MockPayloadGenerator.generate(operation),
          errors: [
            {
              message: 'GraphQlValidationError',
              extensions: {
                nonFieldErrors: [
                  {
                    message: errorMessage,
                    code: 'invalid',
                  },
                ],
              },
            },
          ],
        } as any);
      });
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockConfirmPayment).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should show error message if confirm payment return error', async () => {
      const relayEnvironment = getRelayEnv();
      const paymentIntent = {
        amount: 5,
        clientSecret: 'client-test-secret',
        currency: 'USD',
        pk: 1,
      };
      const errorMessage = 'Something went wrong';
      mockConfirmPayment.mockReturnValue({ error: { message: errorMessage } });
      const onSuccess = jest.fn();

      render(<Component onSuccess={onSuccess} />, {
        relayEnvironment,
      });
      await act(() => {
        relayEnvironment.mock.resolveMostRecentOperation((operation) => {
          return MockPayloadGenerator.generate(operation, {
            PaymentMethodConnection: () => connectionFromArray(paymentMethods),
          });
        });
      });

      await act(async () => {
        await selectProduct();
      });

      await act(async () => {
        await sendForm();
      });

      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(
          operation,
          MockPayloadGenerator.generate(operation, {
            StripePaymentIntentType: () => paymentIntent,
          })
        );
      });

      expect(mockConfirmPayment).toBeCalledWith({
        paymentMethod: expect.anything(),
        paymentIntent: expect.anything(),
      });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});
