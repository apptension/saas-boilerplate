import { ReactNode } from 'react';
import { CardCvcElement, CardExpiryElement, CardNumberElement } from '@stripe/react-stripe-js';
import { useIntl } from 'react-intl';
import { StripeElementChangeEvent } from '@stripe/stripe-js';
import {
  StripeBillingInfoChangeEvent,
  StripePaymentMethodChangeEvent,
  StripePaymentMethodSelectionType,
} from '../stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import {
  Container,
  StripeFieldContainer,
  StripeFieldElement,
  StripeFieldLabel,
  StripeIframeStyles,
  StripeNameField,
} from './stripeCardForm.styles';

type StripeFieldProps = {
  children: ReactNode;
  label: string;
  small?: boolean;
};

const StripeField = ({ children, label, small }: StripeFieldProps) => (
  <StripeFieldContainer small={small}>
    <StripeFieldLabel>{label}</StripeFieldLabel>
    <StripeFieldElement>{children}</StripeFieldElement>
  </StripeFieldContainer>
);

export type StripeCardFormProps = {
  onChange: (data: StripePaymentMethodChangeEvent) => void;
};

export const StripeCardForm = ({ onChange }: StripeCardFormProps) => {
  const intl = useIntl();

  const handleDataChange = (e: StripeElementChangeEvent | StripeBillingInfoChangeEvent) => {
    onChange({
      type: StripePaymentMethodSelectionType.NEW_CARD,
      data: e,
    });
  };

  return (
    <Container>
      <StripeNameField
        name="name"
        required
        label={intl.formatMessage({
          defaultMessage: 'Name',
          id: 'Stripe form / Name label',
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'Write here...',
          id: 'Stripe form / Name placeholder',
        })}
        onChange={(e) => handleDataChange({ value: e.target.value, elementType: 'name' })}
      />

      <StripeField label={intl.formatMessage({ defaultMessage: 'Card number', id: 'Stripe form / card number' })}>
        <CardNumberElement onChange={handleDataChange} options={{ style: StripeIframeStyles, showIcon: true }} />
      </StripeField>

      <StripeField small label={intl.formatMessage({ defaultMessage: 'Year', id: 'Stripe form / expiry date' })}>
        <CardExpiryElement onChange={handleDataChange} options={{ style: StripeIframeStyles }} />
      </StripeField>

      <StripeField small label={intl.formatMessage({ defaultMessage: 'CVC', id: 'Stripe form / CVC' })}>
        <CardCvcElement onChange={handleDataChange} options={{ style: StripeIframeStyles }} />
      </StripeField>
    </Container>
  );
};
