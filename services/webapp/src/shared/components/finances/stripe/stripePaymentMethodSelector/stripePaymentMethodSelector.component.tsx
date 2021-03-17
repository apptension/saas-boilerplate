import React from 'react';
import { FormattedMessage } from 'react-intl';

import { StripePaymentMethod } from '../../../../services/api/stripe/paymentMethod';
import { StripeCardForm } from '../stripeCardForm';
import {
  CardElementContainer,
  Container,
  PaymentMethodList,
  PaymentMethodListItem,
  Heading,
  ExistingPaymentMethodItem,
  NewPaymentMethodItem,
  CardBrand,
} from './stripePaymentMethodSelector.styles';
import {
  StripePaymentMethodChangeEvent,
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from './stripePaymentMethodSelector.types';

export interface StripePaymentMethodSelectorProps {
  paymentMethods: StripePaymentMethod[];
  value: StripePaymentMethodSelection | undefined;
  onChange: (data: StripePaymentMethodChangeEvent) => void;
}

export const StripePaymentMethodSelector = ({
  onChange: propOnChange,
  value,
  paymentMethods,
}: StripePaymentMethodSelectorProps) => {
  const onChange = (e: StripePaymentMethodChangeEvent) => {
    propOnChange(e);
  };

  return (
    <Container>
      <Heading>
        <FormattedMessage
          defaultMessage="Select payment method"
          description="Stripe / payment method selector / label"
        />
      </Heading>

      <PaymentMethodList>
        {paymentMethods.map((paymentMethod) => {
          const isSelected =
            value?.type === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD && paymentMethod.id === value.data.id;

          return (
            <PaymentMethodListItem key={paymentMethod.id}>
              <ExistingPaymentMethodItem
                checked={isSelected}
                value={paymentMethod.id}
                onChange={() => {
                  onChange({
                    type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
                    data: paymentMethod,
                  });
                }}
              >
                {paymentMethod.billingDetails?.name && `${paymentMethod.billingDetails?.name} `}
                <CardBrand>{paymentMethod.card.brand}</CardBrand> **** {paymentMethod.card.last4}
              </ExistingPaymentMethodItem>
            </PaymentMethodListItem>
          );
        })}

        <PaymentMethodListItem>
          <NewPaymentMethodItem
            isSelected={value?.type === StripePaymentMethodSelectionType.NEW_CARD}
            onClick={() => {
              onChange({
                type: StripePaymentMethodSelectionType.NEW_CARD,
                data: null,
              });
            }}
          >
            <FormattedMessage
              defaultMessage="Add a new card"
              description="Stripe / payment method selector / new card option"
            />
          </NewPaymentMethodItem>
        </PaymentMethodListItem>
      </PaymentMethodList>

      {value?.type === StripePaymentMethodSelectionType.NEW_CARD && (
        <CardElementContainer>
          <StripeCardForm onChange={onChange} />
        </CardElementContainer>
      )}
    </Container>
  );
};
