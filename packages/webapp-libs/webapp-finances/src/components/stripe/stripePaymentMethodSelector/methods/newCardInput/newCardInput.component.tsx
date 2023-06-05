import { CardCvcElement, CardExpiryElement, CardNumberElement } from '@stripe/react-stripe-js';
import { StripeElementChangeEvent } from '@stripe/stripe-js';
import { ReactNode } from 'react';
import { Control, useController } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { PaymentFormFields } from '../../stripePaymentMethodSelector.types';
import * as S from './newCardInput.styles';

type StripeFieldProps = {
  children: ReactNode;
  label: string;
  small?: boolean;
};

const StripeField = ({ children, label, small }: StripeFieldProps) => (
  <S.StripeFieldContainer small={small}>
    <S.StripeFieldLabel>{label}</S.StripeFieldLabel>
    <S.StripeFieldElement>{children}</S.StripeFieldElement>
  </S.StripeFieldContainer>
);

type NewCardInputProps = {
  control: Control<PaymentFormFields>;
};
export const NewCardInput = ({ control }: NewCardInputProps) => {
  const intl = useIntl();
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

  const validateStripeElement = (value: StripeElementChangeEvent) => {
    if (value.empty) {
      if (value.elementType === 'cardNumber') {
        return intl.formatMessage({
          defaultMessage: 'Card number is required',
          id: 'Stripe / Payment / Card number required',
        });
      }

      if (value.elementType === 'cardExpiry') {
        return intl.formatMessage({
          defaultMessage: 'Card expiry is required',
          id: 'Stripe / Payment / Card expiry required',
        });
      }

      if (value.elementType === 'cardCvc') {
        return intl.formatMessage({
          defaultMessage: 'Card CVC is required',
          id: 'Stripe / Payment / Card CVC is required',
        });
      }
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
      <S.Container>
        <S.StripeNameField
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
        />

        <StripeField label={intl.formatMessage({ defaultMessage: 'Card number', id: 'Stripe form / card number' })}>
          <CardNumberElement
            {...cardNumberController.field}
            options={{ style: S.StripeIframeStyles, showIcon: true }}
          />
        </StripeField>

        <StripeField small label={intl.formatMessage({ defaultMessage: 'Year', id: 'Stripe form / expiry date' })}>
          <CardExpiryElement {...cardExpiryController.field} options={{ style: S.StripeIframeStyles }} />
        </StripeField>

        <StripeField small label={intl.formatMessage({ defaultMessage: 'CVC', id: 'Stripe form / CVC' })}>
          <CardCvcElement {...cardCvcController.field} options={{ style: S.StripeIframeStyles }} />
        </StripeField>
      </S.Container>

      <S.ErrorMessage>{nameController.fieldState.error?.message?.toString()}</S.ErrorMessage>
      <S.ErrorMessage>{cardNumberController.fieldState.error?.message?.toString()}</S.ErrorMessage>
      <S.ErrorMessage>{cardExpiryController.fieldState.error?.message?.toString()}</S.ErrorMessage>
      <S.ErrorMessage>{cardCvcController.fieldState.error?.message?.toString()}</S.ErrorMessage>
    </>
  );
};
