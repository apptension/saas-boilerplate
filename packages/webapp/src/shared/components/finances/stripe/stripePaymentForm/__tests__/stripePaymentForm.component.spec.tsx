import { Elements } from '@stripe/react-stripe-js';
import { GraphQLError } from 'graphql';
import userEvent from '@testing-library/user-event';
import { append, times } from 'ramda';

import { screen } from '@testing-library/react';
import { render } from '../../../../../../tests/utils/rendering';
import { fillAllPaymentsMethodsQuery, paymentMethodFactory } from '../../../../../../mocks/factories';
import { StripePaymentForm, StripePaymentFormProps } from '../stripePaymentForm.component';

import { TestProduct } from '../../../../../../modules/stripe/stripe.types';

import { Subscription } from '../../../../../../shared/services/api/subscription/types';
import { composeMockedQueryResult } from '../../../../../../tests/utils/fixtures';

import { stripeCreatePaymentIntentMutation } from '../stripePaymentForm.graphql';

const mockConfirmPayment = jest.fn();

jest.mock('../../stripePayment.stripe.hook', () => {
  return {
    ...jest.requireActual<NodeModule>('../../stripePayment.stripe.hook'),
    useStripePayment: () => ({ confirmPayment: mockConfirmPayment }),
  };
});

const mutationVariables = {
  input: {
    product: '5',
  },
};
const mutationData = {
  createPaymentIntent: {
    paymentIntent: {
      id: 'test-id',
      amount: 500,
      clientSecret: 'test-client-secret',
      currency: 'usd',
      pk: 'pk-test-id',
      __typename: 'StripePaymentIntentType',
    },
    __typename: 'CreatePaymentIntentMutationPayload',
  },
};

describe('StripePaymentForm: Component', () => {
  beforeEach(() => {
    mockConfirmPayment.mockClear();
  });

  const allPaymentsMock = times(() => paymentMethodFactory(), 2);

  const defaultProps: StripePaymentFormProps = {
    onSuccess: jest.fn(),
  };

  const Component = (props: Partial<StripePaymentFormProps>) => (
    <Elements stripe={null}>
      <StripePaymentForm {...defaultProps} {...props} />
    </Elements>
  );

  const selectProduct = async (value = TestProduct.A) =>
    userEvent.click(await screen.findByRole('radio', { name: `${value} USD` }));
  const sendForm = async () => userEvent.click(await screen.findByRole('button', { name: /Pay \d+ USD/i }));

  it('should render without errors', async () => {
    const requestMock = fillAllPaymentsMethodsQuery(allPaymentsMock as Partial<Subscription>[]);

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: append(requestMock),
    });

    await waitForApolloMocks();

    expect(await screen.findAllByRole('list')).toHaveLength(2);
  });

  describe('action completes successfully', () => {
    it('should call create payment intent mutation', async () => {
      const requestAllPaymentsMock = fillAllPaymentsMethodsQuery(allPaymentsMock as Partial<Subscription>[]);
      const requestPaymentMutation = composeMockedQueryResult(stripeCreatePaymentIntentMutation, {
        variables: mutationVariables,
        data: mutationData,
      });

      requestPaymentMutation.newData = jest.fn(() => ({
        data: mutationData,
      }));

      render(<Component />, {
        apolloMocks: (defaultProps) => defaultProps.concat(requestAllPaymentsMock, requestPaymentMutation),
      });

      await selectProduct();
      expect(await screen.findByRole('button', { name: /Pay \d+ USD/i })).not.toBeDisabled();
      await sendForm();
      expect(await screen.findByRole('button', { name: /Pay \d+ USD/i })).toBeDisabled();

      expect(requestPaymentMutation.newData).toHaveBeenCalled();
    });

    it('should call confirm payment and onSuccess', async () => {
      const requestAllPaymentsMock = fillAllPaymentsMethodsQuery(allPaymentsMock as Partial<Subscription>[]);
      const requestPaymentMutation = composeMockedQueryResult(stripeCreatePaymentIntentMutation, {
        variables: mutationVariables,
        data: mutationData,
      });

      mockConfirmPayment.mockReturnValue({ paymentIntent: { status: 'succeeded' } });
      const onSuccess = jest.fn();

      const { waitForApolloMocks } = render(<Component onSuccess={onSuccess} />, {
        apolloMocks: (defaultProps) => defaultProps.concat(requestAllPaymentsMock, requestPaymentMutation),
      });

      await selectProduct();
      await sendForm();

      await waitForApolloMocks();

      expect(mockConfirmPayment).toBeCalledWith({
        paymentMethod: expect.anything(),
        paymentIntent: expect.anything(),
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('when something goes wrong', () => {
    it('should show error message if creating payment intent throws error', async () => {
      const errorMessage = 'Something went wrong';
      const requestAllPaymentsMock = fillAllPaymentsMethodsQuery(allPaymentsMock as Partial<Subscription>[]);
      const requestPaymentMutation = composeMockedQueryResult(stripeCreatePaymentIntentMutation, {
        variables: mutationVariables,
        data: [],
        errors: [new GraphQLError(errorMessage)],
      });
      const onSuccess = jest.fn();

      const { waitForApolloMocks } = render(<Component onSuccess={onSuccess} />, {
        apolloMocks: (defaultProps) => defaultProps.concat(requestAllPaymentsMock, requestPaymentMutation),
      });

      await selectProduct();
      await sendForm();

      await waitForApolloMocks();

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockConfirmPayment).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should show error message if confirm payment return error', async () => {
      const requestAllPaymentsMock = fillAllPaymentsMethodsQuery(allPaymentsMock as Partial<Subscription>[]);
      const requestPaymentMutation = composeMockedQueryResult(stripeCreatePaymentIntentMutation, {
        variables: mutationVariables,
        data: mutationData,
      });
      const errorMessage = 'Something went wrong';
      mockConfirmPayment.mockReturnValue({ error: { message: errorMessage } });
      const onSuccess = jest.fn();

      const { waitForApolloMocks } = render(<Component onSuccess={onSuccess} />, {
        apolloMocks: (defaultProps) => defaultProps.concat(requestAllPaymentsMock, requestPaymentMutation),
      });

      await selectProduct();
      await sendForm();

      await waitForApolloMocks();

      expect(mockConfirmPayment).toBeCalledWith({
        paymentMethod: expect.anything(),
        paymentIntent: expect.anything(),
      });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});
