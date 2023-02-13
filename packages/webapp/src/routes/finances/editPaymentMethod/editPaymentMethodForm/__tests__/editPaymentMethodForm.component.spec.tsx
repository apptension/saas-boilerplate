import { Elements } from '@stripe/react-stripe-js';
import { StripeElementChangeEvent } from '@stripe/stripe-js';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { times } from 'ramda';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { MockPayloadGenerator } from 'relay-test-utils';

import {
  fillAllPaymentsMethodsQuery,
  fillSubscriptionScheduleQuery,
  fillSubscriptionScheduleQueryWithPhases,
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../../mocks/factories';
import stripeAllPaymentMethodsQueryGraphql from '../../../../../modules/stripe/__generated__/stripeAllPaymentMethodsQuery.graphql';
import { STRIPE_UPDATE_PAYMENT_METHOD_MUTATION } from '../../../../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.graphql';
import { Subscription, SubscriptionPlanName } from '../../../../../shared/services/api/subscription/types';
import { composeMockedQueryResult, connectionFromArray } from '../../../../../tests/utils/fixtures';
import { getRelayEnv } from '../../../../../tests/utils/relay';
import { render } from '../../../../../tests/utils/rendering';
import { ActiveSubscriptionContext } from '../../../activeSubscriptionContext/activeSubscriptionContext.component';
import { EditPaymentMethodForm, EditPaymentMethodFormProps } from '../editPaymentMethodForm.component';
import { STRIPE_CREATE_SETUP_INTENT_MUTTION } from '../editPaymentMethodForm.graphql';

jest.mock('@stripe/react-stripe-js', () => ({
  ...jest.requireActual<NodeModule>('@stripe/react-stripe-js'),
  CardCvcElement: ({
    options,
    onChange,
    ...rest
  }: {
    options: React.HTMLProps<HTMLInputElement>;
    onChange: (data: StripeElementChangeEvent) => void;
  }) => (
    <input
      {...rest}
      onChange={(e) => {
        const data: StripeElementChangeEvent = {
          elementType: 'cardCvc',
          empty: false,
          complete: true,
          error: undefined,
        };
        onChange(data);
      }}
    />
  ),
  CardExpiryElement: ({
    options,
    onChange,
    ...rest
  }: {
    options: React.HTMLProps<HTMLInputElement>;
    onChange: (data: StripeElementChangeEvent) => void;
  }) => (
    <input
      {...rest}
      onChange={(e) => {
        const data: StripeElementChangeEvent = {
          elementType: 'cardExpiry',
          empty: false,
          complete: true,
          error: undefined,
        };
        onChange(data);
      }}
    />
  ),
  CardNumberElement: ({
    options,
    onChange,
    ...rest
  }: {
    options: React.HTMLProps<HTMLInputElement>;
    onChange: (data: StripeElementChangeEvent) => void;
  }) => (
    <input
      {...rest}
      onChange={(e) => {
        const data: StripeElementChangeEvent = {
          elementType: 'cardNumber',
          empty: false,
          complete: true,
          error: undefined,
        };
        onChange(data);
      }}
    />
  ),
}));

describe('EditPaymentMethodForm: Component', () => {
  const defaultProps = {
    onSuccess: () => null,
  };
  const Component = (props: Partial<EditPaymentMethodFormProps>) => (
    <Routes>
      <Route element={<ActiveSubscriptionContext />}>
        <Route
          index
          element={
            <Elements stripe={null}>
              <EditPaymentMethodForm {...defaultProps} {...props} />
            </Elements>
          }
        />
      </Route>
    </Routes>
  );

  const submitForm = async () => {
    await userEvent.click(await screen.findByRole('button', { name: /save/i }));
  };

  const pressNewCardButton = async () => {
    await userEvent.click(await screen.findByRole('button', { name: /Add a new card/i }));
  };

  const newCardData = {
    name: 'Test card name',
    number: '4111 1111 1111 1111',
    expiry: '12/22',
    cvc: '123',
  };

  const fillForm = async (override = {}) => {
    const data = { ...newCardData, ...override };
    await userEvent.type(await screen.findByLabelText(/^name/i), data.name);
    await userEvent.type(screen.getByLabelText(/^Card number/i), data.number);
    await userEvent.type(screen.getByLabelText(/^Year/i), data.expiry);
    await userEvent.type(screen.getByLabelText(/^cvc/i), data.cvc);
  };

  it('should render without errors', async () => {
    const relayEnvironment = getRelayEnv();
    const paymentMethods = times(() => paymentMethodFactory(), 2);
    fillSubscriptionScheduleQueryWithPhases(relayEnvironment, [
      subscriptionPhaseFactory({
        item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
      }),
    ]);
    relayEnvironment.mock.queueOperationResolver((operation) => {
      return MockPayloadGenerator.generate(operation, {
        PaymentMethodConnection: () => connectionFromArray(paymentMethods),
      });
    });
    relayEnvironment.mock.queuePendingOperation(stripeAllPaymentMethodsQueryGraphql, {});
    render(<Component />, { relayEnvironment });
  });

  it('should set default card if selected other already added card', async () => {
    const relayEnvironment = getRelayEnv();
    const onSuccess = jest.fn();
    const paymentMethods = times(() => paymentMethodFactory(), 2);
    const requestMethodsMock = fillAllPaymentsMethodsQuery(paymentMethods as Partial<Subscription>[]);
    const requestUpdateMutationMock = composeMockedQueryResult(STRIPE_UPDATE_PAYMENT_METHOD_MUTATION, {
      data: { updateDefaultPaymentMethod: {} },
      variables: { input: { id: 'pk-test-id' } },
    });

    const phases = [
      subscriptionPhaseFactory({
        item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
      }),
    ];

    const requestScheduleMock = fillSubscriptionScheduleQuery(
      relayEnvironment,
      subscriptionFactory({
        defaultPaymentMethod: paymentMethods[0],
        phases,
      })
    );
    const { waitForApolloMocks } = render(<Component onSuccess={onSuccess} />, {
      relayEnvironment,
      apolloMocks: (defaultMocks) =>
        defaultMocks.concat(requestMethodsMock, requestScheduleMock, requestUpdateMutationMock),
    });

    await waitForApolloMocks(1);

    const secondMethod = screen.getAllByRole('radio')[1];
    await fireEvent.click(secondMethod);
    expect(await screen.findByRole('button', { name: /save/i })).not.toBeDisabled();

    await submitForm();

    expect(onSuccess).toHaveBeenCalled();
  });

  it('should call create setup intent if added new card', async () => {
    const relayEnvironment = getRelayEnv();
    const onSuccess = jest.fn();
    const phases = [
      subscriptionPhaseFactory({
        item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
      }),
    ];
    const paymentMethods = times(() => paymentMethodFactory(), 2);
    const requestMethodsMock = fillAllPaymentsMethodsQuery(paymentMethods as Partial<Subscription>[]);
    fillSubscriptionScheduleQuery(
      relayEnvironment,
      subscriptionFactory({
        defaultPaymentMethod: paymentMethods[0],
        phases,
      })
    );

    const requestCreateIntentMock = composeMockedQueryResult(STRIPE_CREATE_SETUP_INTENT_MUTTION, {
      data: { createSetupIntent: {} },
      variables: { input: {} },
    });

    requestCreateIntentMock.newData = jest.fn(() => ({
      data: { createSetupIntent: {} },
    }));

    const { waitForApolloMocks } = render(<Component onSuccess={onSuccess} />, {
      relayEnvironment,
      apolloMocks: (defaultMocks) => defaultMocks.concat(requestMethodsMock, requestCreateIntentMock),
    });

    await waitForApolloMocks(1);

    await pressNewCardButton();
    await fillForm();
    await submitForm();

    expect(requestCreateIntentMock.newData).toBeCalled();
  });
});
