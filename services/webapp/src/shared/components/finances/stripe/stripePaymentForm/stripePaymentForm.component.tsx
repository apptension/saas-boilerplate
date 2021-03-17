import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Controller, NestedValue } from 'react-hook-form';

import { StripeElementChangeEvent } from '@stripe/stripe-js';
import { StripePaymentIntent, TestProduct } from '../../../../services/api/stripe/paymentIntent';
import { useApiForm } from '../../../../hooks/useApiForm';
import { useStripePayment, useStripePaymentIntent, useStripePaymentMethods } from '../stripePayment.hooks';
import { StripePaymentMethodSelector } from '../stripePaymentMethodSelector';
import {
  StripePaymentMethodChangeEvent,
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from '../stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import {
  ErrorMessage,
  Form,
  Heading,
  ProductListContainer,
  ProductListItem,
  ProductListItemButton,
  SubmitButton,
} from './stripePaymentForm.styles';

interface StripePaymentFormFields {
  product: TestProduct;
  paymentMethod: NestedValue<StripePaymentMethodSelection>;
}

export interface StripePaymentFormProps {
  onSuccess(paymentIntent: StripePaymentIntent): void;
}

export const StripePaymentForm = ({ onSuccess }: StripePaymentFormProps) => {
  const intl = useIntl();
  const { updateOrCreatePaymentIntent } = useStripePaymentIntent();
  const { confirmPayment } = useStripePayment();
  const { isLoading: arePaymentMethodsLoading, paymentMethods } = useStripePaymentMethods();
  const {
    register,
    control,
    handleSubmit,
    errors,
    setApiResponse,
    genericError,
    setGenericError,
    formState,
    watch,
  } = useApiForm<StripePaymentFormFields>({
    mode: 'onChange',
  });
  const amountValue = watch('product');
  const onSubmit = async (data: StripePaymentFormFields) => {
    const paymentIntentResponse = await updateOrCreatePaymentIntent(data.product);
    if (paymentIntentResponse.isError) {
      return setApiResponse(paymentIntentResponse);
    }

    const result = await confirmPayment({
      paymentMethod: data.paymentMethod,
      paymentIntent: paymentIntentResponse,
    });

    if (!result) {
      return;
    }

    if (result.error) {
      return setGenericError(result.error.message);
    }

    if (result.paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntentResponse);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Heading>
          <FormattedMessage defaultMessage="Choose the product" description="Stripe / payment form / product label" />
        </Heading>

        <ProductListContainer>
          {Object.values(TestProduct).map((amount) => (
            <ProductListItem key={amount}>
              <ProductListItemButton
                name="product"
                value={amount}
                ref={register({
                  required: {
                    value: true,
                    message: intl.formatMessage({
                      defaultMessage: 'Product is required',
                      description: 'Stripe / Payment / Product required',
                    }),
                  },
                })}
              >
                {amount} zł
              </ProductListItemButton>
            </ProductListItem>
          ))}
        </ProductListContainer>
        <ErrorMessage>{errors.product?.message}</ErrorMessage>
      </div>

      {!arePaymentMethodsLoading && (
        <div>
          <Controller
            name="paymentMethod"
            control={control}
            defaultValue={{
              type:
                paymentMethods?.length > 0
                  ? StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD
                  : StripePaymentMethodSelectionType.NEW_CARD,
              data: paymentMethods?.[0] ?? null,
            }}
            rules={{
              required: true,
              validate: (value: StripePaymentMethodSelection) => {
                if (value.type === StripePaymentMethodSelectionType.NEW_CARD) {
                  const anyFieldMissing = Object.values(value.data?.cardMissingFields ?? {}).some(
                    (isMissing) => isMissing
                  );
                  const fieldError = Object.values(value.data?.cardErrors ?? {})?.filter((error) => !!error)?.[0];

                  if (fieldError) {
                    return fieldError.message;
                  }

                  if (value.data === null || anyFieldMissing) {
                    return intl.formatMessage({
                      defaultMessage: 'Payment method is required',
                      description: 'Stripe / Payment / Method required',
                    });
                  }

                  if (!value.data.name) {
                    return intl.formatMessage({
                      defaultMessage: 'Card name is required',
                      description: 'Stripe / Payment / Card name required',
                    });
                  }
                }

                return true;
              },
            }}
            render={({ onChange, value }) => {
              const handleChange = (e: StripePaymentMethodChangeEvent) => {
                if (e.type === StripePaymentMethodSelectionType.NEW_CARD) {
                  const data =
                    value.type === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD
                      ? {
                          cardMissingFields: {
                            cardNumber: true,
                            cardExpiry: true,
                            cardCvc: true,
                          },
                        }
                      : value.data;

                  if (e.data?.elementType === 'name') {
                    onChange({ type: e.type, data: { ...data, name: e.data.value } });
                  } else {
                    const stripeFieldData = e.data as StripeElementChangeEvent;
                    const fieldName = e.data?.elementType as string;

                    const cardData = {
                      cardErrors: { ...value.data.cardErrors, [fieldName]: stripeFieldData?.error },
                      cardMissingFields: {
                        ...data.cardMissingFields,
                        [fieldName]: !!stripeFieldData?.empty,
                      },
                    };
                    onChange({ type: e.type, data: { ...data, ...(fieldName ? cardData : {}) } });
                  }
                } else {
                  onChange(e);
                }
              };
              return (
                <StripePaymentMethodSelector onChange={handleChange} value={value} paymentMethods={paymentMethods} />
              );
            }}
          />
          <ErrorMessage>{errors.paymentMethod?.message}</ErrorMessage>
          {Object.keys(errors).length === 0 && genericError && <ErrorMessage>{genericError}</ErrorMessage>}
        </div>
      )}

      <SubmitButton disabled={!formState.isValid || formState.isSubmitting}>
        <FormattedMessage
          values={{ amount: amountValue ? `${amountValue} zł` : '' }}
          defaultMessage="Pay {amount}"
          description="Stripe / payment form / pay CTA"
        />
      </SubmitButton>
    </Form>
  );
};
