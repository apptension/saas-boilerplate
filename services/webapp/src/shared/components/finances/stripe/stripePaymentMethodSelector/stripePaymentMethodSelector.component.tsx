import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { FormattedMessage } from 'react-intl';

import { StripePaymentMethod } from '../../../../services/api/stripe/paymentMethod';
import {
  CardElementContainer,
  Container,
  PaymentMethodList,
  PaymentMethodListItem,
} from './stripePaymentMethodSelector.styles';
import { StripePaymentMethodSelection, StripePaymentMethodSelectionType } from './stripePaymentMethodSelector.types';

export interface StripePaymentMethodSelectorProps {
  paymentMethods: StripePaymentMethod[];
  value: StripePaymentMethodSelection | undefined;
  onChange: (data: StripePaymentMethodSelection) => void;
}

export const StripePaymentMethodSelector = ({ onChange, value, paymentMethods }: StripePaymentMethodSelectorProps) => {
  return (
    <Container>
      <FormattedMessage defaultMessage="Select payment method" description="Stripe / payment method selector / label" />

      <PaymentMethodList>
        {paymentMethods.map((paymentMethod) => {
          const isSelected =
            value?.type === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD && paymentMethod.id === value.data.id;

          return (
            <PaymentMethodListItem
              key={paymentMethod.id}
              onClick={() => {
                onChange({
                  type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
                  data: paymentMethod,
                });
              }}
              isSelected={isSelected}
            >
              [{paymentMethod.card.brand}] **** {paymentMethod.card.last4}
            </PaymentMethodListItem>
          );
        })}

        <PaymentMethodListItem
          onClick={() => {
            onChange({
              type: StripePaymentMethodSelectionType.NEW_CARD,
              data: null,
            });
          }}
          isSelected={value?.type === StripePaymentMethodSelectionType.NEW_CARD}
        >
          <FormattedMessage
            defaultMessage="Add a new card."
            description="Stripe / payment method selector / new card option"
          />
        </PaymentMethodListItem>
      </PaymentMethodList>

      {value?.type === StripePaymentMethodSelectionType.NEW_CARD && (
        <CardElementContainer>
          <CardElement
            onChange={(e) =>
              onChange({
                type: StripePaymentMethodSelectionType.NEW_CARD,
                data: e,
              })
            }
            options={{
              style: {
                base: {
                  color: '#32325d',
                  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                  fontSmoothing: 'antialiased',
                  fontSize: '16px',
                  '::placeholder': { color: '#aab7c4' },
                },
                invalid: { color: '#fa755a', iconColor: '#fa755a' },
              },
            }}
          />
        </CardElementContainer>
      )}
    </Container>
  );
};
