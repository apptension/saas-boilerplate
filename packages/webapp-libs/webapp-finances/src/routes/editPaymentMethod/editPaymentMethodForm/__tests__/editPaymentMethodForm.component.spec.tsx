import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import {
  currentUserFactory,
  fillCommonQueryWithUser,
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils/fixtures';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { Elements } from '@stripe/react-stripe-js';
import { StripeElementChangeEvent } from '@stripe/stripe-js';
import { fireEvent, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { times } from 'ramda';
import React, { forwardRef } from 'react';
import { Route, Routes } from 'react-router-dom';

import { ActiveSubscriptionContext } from '../../../../components/activeSubscriptionContext';
import { stripeUpdateDefaultPaymentMethodMutation } from '../../../../components/stripe';
import { fillSubscriptionScheduleQuery, fillSubscriptionScheduleQueryWithPhases } from '../../../../tests/factories';
import { render } from '../../../../tests/utils/rendering';
import { EditPaymentMethodForm, EditPaymentMethodFormProps } from '../editPaymentMethodForm.component';
import { stripeCreateSetupIntentMutation } from '../editPaymentMethodForm.graphql';

jest.mock('@sb/webapp-core/services/analytics');

jest.mock('@stripe/react-stripe-js', () => {
  const React = require('react');
  return {
    ...jest.requireActual<NodeModule>('@stripe/react-stripe-js'),
    CardCvcElement: React.forwardRef((props: {
      options: React.HTMLProps<HTMLInputElement>;
      onChange: (data: StripeElementChangeEvent) => void;
      [key: string]: any;
    }, ref: React.Ref<HTMLInputElement>) => (
      <input
        ref={ref}
        {...props}
        onChange={(e) => {
          props.onChange({
            elementType: 'cardCvc',
            empty: false,
            complete: true,
            error: undefined,
          });
        }}
      />
    )),
    CardExpiryElement: React.forwardRef((props: {
      options: React.HTMLProps<HTMLInputElement>;
      onChange: (data: StripeElementChangeEvent) => void;
      [key: string]: any;
    }, ref: React.Ref<HTMLInputElement>) => (
      <input
        ref={ref}
        {...props}
        onChange={(e) => {
          props.onChange({
            elementType: 'cardExpiry',
            empty: false,
            complete: true,
            error: undefined,
          });
        }}
      />
    )),
    CardNumberElement: React.forwardRef((props: {
      options: React.HTMLProps<HTMLInputElement>;
      onChange: (data: StripeElementChangeEvent) => void;
      [key: string]: any;
    }, ref: React.Ref<HTMLInputElement>) => (
      <input
        ref={ref}
        {...props}
        onChange={(e) => {
          props.onChange({
            elementType: 'cardNumber',
            empty: false,
            complete: true,
            error: undefined,
          });
        }}
      />
    )),
  };
});

const tenantId = 'tenantId';

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
    await userEvent.click(await screen.findByRole('button', { name: /Use a new card/i }));
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
    const tenantMock = fillCommonQueryWithUser(
      currentUserFactory({
        tenants: [
          tenantFactory({
            id: tenantId,
          }),
        ],
      })
    );
    const paymentMethods = times(() => paymentMethodFactory(), 2);
    const requestMock = fillSubscriptionScheduleQueryWithPhases(
      [
        subscriptionPhaseFactory({
          item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
        }),
      ],
      paymentMethods
    );
    const { waitForApolloMocks } = render(<Component />, { apolloMocks: [requestMock, tenantMock] });
    await waitForApolloMocks();
  });

  it('should set default card if selected other already added card', async () => {
    const tenantMock = fillCommonQueryWithUser(
      currentUserFactory({
        tenants: [
          tenantFactory({
            id: tenantId,
          }),
        ],
      })
    );
    const onSuccess = jest.fn();
    const id = 'pk-test-id';
    const paymentMethods = times(() => paymentMethodFactory(), 2);
    const requestMethodsMock = fillSubscriptionScheduleQuery(subscriptionFactory({ id }), paymentMethods, tenantId);
    const requestUpdateMutationMock = composeMockedQueryResult(stripeUpdateDefaultPaymentMethodMutation, {
      data: {
        updateDefaultPaymentMethod: {
          activeSubscription: subscriptionFactory(),
          paymentMethodEdge: {
            node: {
              id,
            },
          },
        },
      },
      variables: { input: { id, tenantId } },
    });

    const phases = [
      subscriptionPhaseFactory({
        item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
      }),
    ];
    const requestMock = fillSubscriptionScheduleQueryWithPhases(phases, paymentMethods, tenantId);

    const { waitForApolloMocks } = render(<Component onSuccess={onSuccess} />, {
      apolloMocks: [tenantMock, requestMock, requestMethodsMock, requestUpdateMutationMock],
    });

    await waitForApolloMocks(1);

    const radioButtons = await screen.findAllByRole('radio');

    fireEvent.change(radioButtons[1], { target: { value: 'checked' } });
    expect(await screen.findByRole('button', { name: /save/i })).not.toBeDisabled();

    await submitForm();
    await waitForApolloMocks();

    expect(onSuccess).toHaveBeenCalled();
  });

  it('should call create setup intent if added new card', async () => {
    const tenantMock = fillCommonQueryWithUser(
      currentUserFactory({
        tenants: [
          tenantFactory({
            id: tenantId,
          }),
        ],
      })
    );
    const onSuccess = jest.fn();
    const phases = [
      subscriptionPhaseFactory({
        item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
      }),
    ];
    const paymentMethods = times(() => paymentMethodFactory(), 2);

    const requestCreateIntentMock = composeMockedQueryResult(stripeCreateSetupIntentMutation, {
      data: { createSetupIntent: {} },
      variables: { input: { tenantId } },
    });

    requestCreateIntentMock.newData = jest.fn(() => ({
      data: {
        createSetupIntent: {
          setupIntent: {
            id: 'test-id-3',
          },
        },
      },
    }));

    const requestMock = fillSubscriptionScheduleQueryWithPhases(phases, paymentMethods, tenantId);

    render(<Component onSuccess={onSuccess} />, {
      apolloMocks: [tenantMock, requestMock, requestCreateIntentMock],
    });

    await pressNewCardButton();
    await fillForm();
    await submitForm();

    expect(requestCreateIntentMock.newData).toBeCalled();
  });
});
