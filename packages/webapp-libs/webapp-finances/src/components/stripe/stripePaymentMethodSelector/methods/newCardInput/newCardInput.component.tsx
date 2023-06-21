import { Input } from '@sb/webapp-core/components/forms';
import { useTheme } from '@sb/webapp-core/hooks/useTheme';
import { cn } from '@sb/webapp-core/lib/utils';
import { CardCvcElement, CardExpiryElement, CardNumberElement } from '@stripe/react-stripe-js';
import { StripeElementChangeEvent, StripeElementType } from '@stripe/stripe-js';
import { ReactNode } from 'react';
import { Control, useController } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { PaymentFormFields } from '../../stripePaymentMethodSelector.types';
import * as S from './newCardInput.styles';

type StripeFieldProps = {
  children: ReactNode;
  label: string;
  hasError?: boolean;
};

const StripeField = ({ children, label, hasError }: StripeFieldProps) => (
  <label>
    <p
      className={cn('text-xs font-medium', {
        'text-red-500': hasError,
      })}
    >
      {label}
    </p>
    <div>{children}</div>
  </label>
);

type NewCardInputProps = {
  control: Control<PaymentFormFields>;
};

export const NewCardInput = ({ control }: NewCardInputProps) => {
  const intl = useIntl();
  const { theme } = useTheme();
  const nameController = useController({
    name: 'paymentMethod.newCard.name',
    defaultValue: '',
    control,
    shouldUnregister: true,
    rules: {
      required: {
        value: true,
        message: intl.formatMessage({
          defaultMessage: 'Card name is required',
          id: 'Stripe / Payment / Card name required',
        }),
      },
    },
  });

  const stripeRequiredErrorMap: Partial<Record<StripeElementType, string>> = {
    cardNumber: intl.formatMessage({
      defaultMessage: 'Card number is required',
      id: 'Stripe / Payment / Card number required',
    }),
    cardExpiry: intl.formatMessage({
      defaultMessage: 'Card expiry is required',
      id: 'Stripe / Payment / Card expiry required',
    }),
    cardCvc: intl.formatMessage({
      defaultMessage: 'Card CVC is required',
      id: 'Stripe / Payment / Card CVC is required',
    }),
  };

  const validateStripeElement = (value: StripeElementChangeEvent) => {
    if (value.empty) {
      return (
        stripeRequiredErrorMap[value.elementType] ||
        intl.formatMessage({
          defaultMessage: 'This field is required',
          id: 'Stripe / Payment / Card field required',
        })
      );
    }
    if (value.error) {
      return value.error.message;
    }
    return true;
  };

  const cardNumberController = useController({
    name: 'paymentMethod.newCard.cardNumber',
    control,
    defaultValue: {
      complete: false,
      empty: true,
      elementType: 'cardNumber',
      error: undefined,
    },
    shouldUnregister: true,
    rules: { validate: validateStripeElement },
  });

  const cardExpiryController = useController({
    name: 'paymentMethod.newCard.cardExpiry',
    control,
    defaultValue: {
      complete: false,
      empty: true,
      elementType: 'cardExpiry',
      error: undefined,
    },
    shouldUnregister: true,
    rules: { validate: validateStripeElement },
  });

  const cardCvcController = useController({
    name: 'paymentMethod.newCard.cardCvc',
    control,
    defaultValue: {
      complete: false,
      empty: true,
      elementType: 'cardCvc',
      error: undefined,
    },
    shouldUnregister: true,
    rules: { validate: validateStripeElement },
  });

  return (
    <>
      <div className="space-y-6">
        <Input
          className="w-full max-w-none mb-3"
          {...nameController.field}
          required
          label={intl.formatMessage({
            defaultMessage: 'Name',
            id: 'Stripe form / Name label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Write here...',
            id: 'Stripe form / Name placeholder',
          })}
          error={nameController.fieldState.error?.message?.toString()}
        />

        <div className="flex flex-row space-x-2">
          <div className="flex-1">
            <StripeField
              label={intl.formatMessage({ defaultMessage: 'Card number', id: 'Stripe form / card number' })}
              hasError={!!cardNumberController.fieldState.error?.message?.toString()}
            >
              <CardNumberElement
                {...cardNumberController.field}
                options={{ style: S.StripeIframeStyles(theme), classes: S.StripeIframeClasses, showIcon: true }}
              />
            </StripeField>
          </div>
          <div className="min-w-[90px] w-1/7">
            <StripeField
              label={intl.formatMessage({ defaultMessage: 'Year', id: 'Stripe form / expiry date' })}
              hasError={!!cardExpiryController.fieldState.error?.message?.toString()}
            >
              <CardExpiryElement
                {...cardExpiryController.field}
                options={{ style: S.StripeIframeStyles(theme), classes: S.StripeIframeClasses }}
              />
            </StripeField>
          </div>
          <div className="min-w-[90px] w-1/7">
            <StripeField
              label={intl.formatMessage({ defaultMessage: 'CVC', id: 'Stripe form / CVC' })}
              hasError={!!cardCvcController.fieldState.error?.message?.toString()}
            >
              <CardCvcElement
                {...cardCvcController.field}
                options={{ style: S.StripeIframeStyles(theme), classes: S.StripeIframeClasses }}
              />
            </StripeField>
          </div>
        </div>
      </div>

      <div className="m-0 text-xs leading-3 text-red-500">
        {cardNumberController.fieldState.error?.message?.toString()}
      </div>
      <div className="m-0 text-xs leading-3 text-red-500">
        {cardExpiryController.fieldState.error?.message?.toString()}
      </div>
      <div className="m-0 text-xs leading-3 text-red-500">
        {cardCvcController.fieldState.error?.message?.toString()}
      </div>
    </>
  );
};
