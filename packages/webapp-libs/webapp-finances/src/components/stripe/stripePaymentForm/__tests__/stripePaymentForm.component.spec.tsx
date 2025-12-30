import { Subscription } from '@sb/webapp-api-client/api/subscription/types';
import {
  currentUserFactory,
  fillCommonQueryWithUser,
  paymentMethodFactory,
  subscriptionFactory,
} from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils/fixtures';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { Elements } from '@stripe/react-stripe-js';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { times } from 'ramda';

import { fillAllPaymentsMethodsQuery, fillSubscriptionScheduleQuery } from '../../../../tests/factories';
import { render } from '../../../../tests/utils/rendering';
import { TestProduct } from '../../../../types';
import { StripePaymentForm, StripePaymentFormProps } from '../stripePaymentForm.component';
import { stripeCreatePaymentIntentMutation } from '../stripePaymentForm.graphql';

const mockConfirmPayment = jest.fn();

jest.mock('../../stripePayment.stripe.hook', () => {
  return {
    ...jest.requireActual<NodeModule>('../../stripePayment.stripe.hook'),
    useStripePayment: () => ({ confirmPayment: mockConfirmPayment }),
  };
});

jest.mock('@sb/webapp-core/services/analytics');

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

const tenantId = 'tenantId';

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
    userEvent.click(await screen.findByRole('radio', { name: `$${value}` }));
  const sendForm = async () => userEvent.click(await screen.findByRole('button', { name: /Pay \d+ USD/i }));

  it('should render without errors', async () => {
    const tenantMock = fillCommonQueryWithUser(
      currentUserFactory({
        tenants: [
          tenantFactory({
            id: tenantId,
          }),
        ],
      })
    );
    const requestSubscriptionScheduleMock = fillSubscriptionScheduleQuery(
      subscriptionFactory({
        defaultPaymentMethod: allPaymentsMock[0],
      }),
      allPaymentsMock,
      tenantId
    );

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: [tenantMock, requestSubscriptionScheduleMock],
    });

    // Wait for tenant mock first (index 0), then subscription schedule mock (index 1)
    await waitForApolloMocks(0);
    await waitForApolloMocks(1);

    expect(await screen.findAllByRole('radio')).toHaveLength(allPaymentsMock.length + Object.keys(TestProduct).length);
  });

  describe('action completes successfully', () => {
    it('should call create payment intent mutation', async () => {
      const mutationVariables = {
        input: {
          product: '5',
          tenantId,
        },
      };
      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );
      const requestSubscriptionScheduleMock = fillSubscriptionScheduleQuery(
        subscriptionFactory({
          defaultPaymentMethod: allPaymentsMock[0],
        }),
        allPaymentsMock,
        tenantId
      );
      const requestPaymentMutation = composeMockedQueryResult(stripeCreatePaymentIntentMutation, {
        variables: mutationVariables,
        data: mutationData,
      });

      const { waitForApolloMocks } = render(<Component />, {
        apolloMocks: [tenantMock, requestSubscriptionScheduleMock, requestPaymentMutation],
      });

      // Wait for tenant and subscription schedule to load
      await waitForApolloMocks(0);
      await waitForApolloMocks(1);

      await selectProduct();
      expect(await screen.findByRole('button', { name: /Pay \d+ USD/i })).not.toBeDisabled();
      await sendForm();

      // Wait for the mutation to complete
      await waitForApolloMocks(2);
      expect(requestPaymentMutation.result).toHaveBeenCalled();
    });

    it('should call confirm payment and onSuccess', async () => {
      const mutationVariables = {
        input: {
          product: '5',
          tenantId,
        },
      };
      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );
      const requestSubscriptionScheduleMock = fillSubscriptionScheduleQuery(
        subscriptionFactory({
          defaultPaymentMethod: allPaymentsMock[0],
        }),
        allPaymentsMock,
        tenantId
      );
      const requestPaymentMutation = composeMockedQueryResult(stripeCreatePaymentIntentMutation, {
        variables: mutationVariables,
        data: mutationData,
      });

      mockConfirmPayment.mockReturnValue({ paymentIntent: { status: 'succeeded' } });
      const onSuccess = jest.fn();

      const { waitForApolloMocks } = render(<Component onSuccess={onSuccess} />, {
        apolloMocks: [tenantMock, requestSubscriptionScheduleMock, requestPaymentMutation],
      });

      // Wait for tenant and subscription schedule to load
      await waitForApolloMocks(0);
      await waitForApolloMocks(1);

      await selectProduct();
      await sendForm();

      // Wait for the mutation to complete
      await waitForApolloMocks(2);

      expect(mockConfirmPayment).toBeCalledWith({
        paymentMethod: expect.anything(),
        paymentIntent: expect.anything(),
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith('payment', 'make-payment', 'succeeded');
    });
  });

  describe('when something goes wrong', () => {
    it('should show error message if creating payment intent throws error', async () => {
      const mutationVariables = {
        input: {
          product: '5',
          tenantId,
        },
      };
      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );
      const errorMessage = 'Something went wrong';
      const requestSubscriptionScheduleMock = fillSubscriptionScheduleQuery(
        subscriptionFactory({
          defaultPaymentMethod: allPaymentsMock[0],
        }),
        allPaymentsMock,
        tenantId
      );
      const requestPaymentMutation = composeMockedQueryResult(stripeCreatePaymentIntentMutation, {
        variables: mutationVariables,
        data: {},
        errors: [new GraphQLError(errorMessage)],
      });
      const onSuccess = jest.fn();

      const { waitForApolloMocks } = render(<Component onSuccess={onSuccess} />, {
        apolloMocks: [tenantMock, requestSubscriptionScheduleMock, requestPaymentMutation],
      });

      // Wait for tenant and subscription schedule to load
      await waitForApolloMocks(0);
      await waitForApolloMocks(1);

      await selectProduct();
      await sendForm();

      // Wait for the error to be displayed
      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
      expect(mockConfirmPayment).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should show error message if confirm payment return error', async () => {
      const mutationVariables = {
        input: {
          product: '5',
          tenantId,
        },
      };
      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );
      const requestSubscriptionScheduleMock = fillSubscriptionScheduleQuery(
        subscriptionFactory({
          defaultPaymentMethod: allPaymentsMock[0],
        }),
        allPaymentsMock,
        tenantId
      );
      const requestPaymentMutation = composeMockedQueryResult(stripeCreatePaymentIntentMutation, {
        variables: mutationVariables,
        data: mutationData,
      });
      const errorMessage = 'Something went wrong';
      mockConfirmPayment.mockReturnValue({ error: { message: errorMessage } });
      const onSuccess = jest.fn();

      const { waitForApolloMocks } = render(<Component onSuccess={onSuccess} />, {
        apolloMocks: [tenantMock, requestSubscriptionScheduleMock, requestPaymentMutation],
      });

      // Wait for tenant and subscription schedule to load
      await waitForApolloMocks(0);
      await waitForApolloMocks(1);

      await selectProduct();
      await sendForm();

      // Wait for mutation and error display
      await waitForApolloMocks(2);

      expect(mockConfirmPayment).toBeCalledWith({
        paymentMethod: expect.anything(),
        paymentIntent: expect.anything(),
      });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});
