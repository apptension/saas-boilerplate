import { Input } from '@sb/webapp-core/components/forms';
import { CardCvcElement, CardExpiryElement, CardNumberElement } from '@stripe/react-stripe-js';
import { StripeElementChangeEvent } from '@stripe/stripe-js';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';

import {
  StripeBillingInfoChangeEvent,
  StripePaymentMethodChangeEvent,
  StripePaymentMethodSelectionType,
} from '../stripePaymentMethodSelector';
import { StripeIframeClasses, StripeIframeStyles } from './stripeCardForm.styles';

type StripeFieldProps = {
  children: ReactNode;
  label: string;
};

const StripeField = ({ children, label }: StripeFieldProps) => (
  <label>
    <p className="text-xs font-medium">{label}</p>
    <div>{children}</div>
  </label>
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
    <div className="space-y-3">
      <Input
        className="w-full max-w-none mb-3"
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

      <div className="flex flex-row space-x-2">
        <div className="flex-1">
          <StripeField label={intl.formatMessage({ defaultMessage: 'Card number', id: 'Stripe form / card number' })}>
            <CardNumberElement
              onChange={handleDataChange}
              options={{
                style: StripeIframeStyles,
                classes: StripeIframeClasses,
                showIcon: true,
              }}
            />
          </StripeField>
        </div>
        <div className="min-w-[90px] w-1/7">
          <StripeField label={intl.formatMessage({ defaultMessage: 'Year', id: 'Stripe form / expiry date' })}>
            <CardExpiryElement
              onChange={handleDataChange}
              options={{ style: StripeIframeStyles, classes: StripeIframeClasses }}
            />
          </StripeField>
        </div>
        <div className="min-w-[90px] w-1/7">
          <StripeField label={intl.formatMessage({ defaultMessage: 'CVC', id: 'Stripe form / CVC' })}>
            <CardCvcElement
              onChange={handleDataChange}
              options={{ style: StripeIframeStyles, classes: StripeIframeClasses }}
            />
          </StripeField>
        </div>
      </div>
    </div>
  );
};
