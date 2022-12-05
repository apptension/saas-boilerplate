import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { MockPayloadGenerator } from 'relay-test-utils';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { times } from 'ramda';
import { Route, Routes } from 'react-router-dom';
import { StripeElementChangeEvent } from '@stripe/stripe-js';

import { EditPaymentMethodForm, EditPaymentMethodFormProps } from '../editPaymentMethodForm.component';
import {
  fillSubscriptionScheduleQuery,
  fillSubscriptionScheduleQueryWithPhases,
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../../mocks/factories';
import { render } from '../../../../../tests/utils/rendering';
import { SubscriptionPlanName } from '../../../../../shared/services/api/subscription/types';
import { ActiveSubscriptionContext } from '../../../activeSubscriptionContext/activeSubscriptionContext.component';
import { getRelayEnv } from '../../../../../tests/utils/relay';
import stripeAllPaymentMethodsQueryGraphql from '../../../../../modules/stripe/__generated__/stripeAllPaymentMethodsQuery.graphql';
import { connectionFromArray } from '../../../../../tests/utils/fixtures';

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
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
  };

  const pressNewCardButton = async () => {
    await userEvent.click(screen.getByRole('button', { name: /Add a new card/i }));
  };

  const newCardData = {
    name: 'Test card name',
    number: '4111 1111 1111 1111',
    expiry: '12/22',
    cvc: '123',
  };

  const fillForm = async (override = {}) => {
    const data = { ...newCardData, ...override };
    await userEvent.type(screen.getByLabelText(/^name/i), data.name);
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
    const phases = [
      subscriptionPhaseFactory({
        item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
      }),
    ];
    const paymentMethods = times(() => paymentMethodFactory(), 2);
    relayEnvironment.mock.queueOperationResolver((operation) => {
      return MockPayloadGenerator.generate(operation, {
        PaymentMethodConnection: () => connectionFromArray(paymentMethods),
      });
    });
    relayEnvironment.mock.queuePendingOperation(stripeAllPaymentMethodsQueryGraphql, {});
    fillSubscriptionScheduleQuery(
      relayEnvironment,
      subscriptionFactory({
        defaultPaymentMethod: paymentMethods[0],
        phases,
      })
    );
    render(<Component onSuccess={onSuccess} />, { relayEnvironment });

    await act(async () => {
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });

    await act(async () => {
      await submitForm();
    });

    expect(relayEnvironment).toHaveOperation('stripeUpdateDefaultPaymentMethodMutation');

    await act(async () => {
      const operation = relayEnvironment.mock.getMostRecentOperation();
      relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
    });

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
    fillSubscriptionScheduleQuery(
      relayEnvironment,
      subscriptionFactory({
        defaultPaymentMethod: paymentMethods[0],
        phases,
      })
    );
    relayEnvironment.mock.queueOperationResolver((operation) => {
      return MockPayloadGenerator.generate(operation, {
        PaymentMethodConnection: () => connectionFromArray(paymentMethods),
      });
    });
    relayEnvironment.mock.queuePendingOperation(stripeAllPaymentMethodsQueryGraphql, {});
    render(<Component onSuccess={onSuccess} />, { relayEnvironment });

    await act(async () => {
      await pressNewCardButton();
    });

    await act(async () => {
      await fillForm();
    });

    await act(async () => {
      await submitForm();
    });

    expect(relayEnvironment).toHaveOperation('stripeCreateSetupIntentMutation');
    await act(async () => {
      const operation = relayEnvironment.mock.getMostRecentOperation();
      relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
    });
  });
});
