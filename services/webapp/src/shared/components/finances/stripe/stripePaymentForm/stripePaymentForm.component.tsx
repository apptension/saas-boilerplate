import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Controller, NestedValue } from 'react-hook-form';

import { StripePaymentIntent, TestProduct } from '../../../../services/api/stripe/paymentIntent';
import { useApiForm } from '../../../../hooks/useApiForm';
import { Button } from '../../../button';
import { useStripePayment, useStripePaymentIntent, useStripePaymentMethods } from '../stripePayment.hooks';
import { StripePaymentMethodSelector } from '../stripePaymentMethodSelector';
import {
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from '../stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import {
  ErrorMessage,
  Form,
  ProductListContainer,
  ProductListItem,
  ProductListItemButton,
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
  const { paymentMethods } = useStripePaymentMethods();
  const {
    register,
    control,
    handleSubmit,
    errors,
    setApiResponse,
    genericError,
    setGenericError,
    formState,
  } = useApiForm<StripePaymentFormFields>({
    mode: 'onChange',
  });

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
      {Object.keys(errors).length === 0 && genericError && <ErrorMessage>{genericError}</ErrorMessage>}

      <div>
        <FormattedMessage defaultMessage="Choose the product" description="Stripe / payment form / product label" />

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

      <div>
        <Controller
          name="paymentMethod"
          control={control}
          defaultValue={{
            type: StripePaymentMethodSelectionType.NEW_CARD,
            data: null,
          }}
          rules={{
            required: true,
            validate: (value: StripePaymentMethodSelection) => {
              if (value.type === StripePaymentMethodSelectionType.NEW_CARD) {
                if (value.data?.error) {
                  return value.data.error.message;
                }

                if (value.data === null || value.data.empty) {
                  return intl.formatMessage({
                    defaultMessage: 'Payment method is required',
                    description: 'Stripe / Payment / Method required',
                  });
                }
              }

              return true;
            },
          }}
          render={({ onChange, value }) => (
            <StripePaymentMethodSelector onChange={onChange} value={value} paymentMethods={paymentMethods} />
          )}
        />
        <ErrorMessage>{errors.paymentMethod?.message}</ErrorMessage>
      </div>

      <Button type="submit" disabled={!formState.isValid || formState.isSubmitting}>
        <FormattedMessage defaultMessage="Pay" description="Stripe / payment form / pay CTA" />
      </Button>
    </Form>
  );
};
