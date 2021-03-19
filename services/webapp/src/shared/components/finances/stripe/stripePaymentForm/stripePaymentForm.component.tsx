import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { StripePaymentIntent, TestProduct } from '../../../../services/api/stripe/paymentIntent';
import { useApiForm } from '../../../../hooks/useApiForm';
import { useStripePayment, useStripePaymentIntent } from '../stripePayment.hooks';
import { StripePaymentMethodSelector } from '../stripePaymentMethodSelector';
import { PaymentFormFields } from '../stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import {
  ErrorMessage,
  Form,
  Heading,
  ProductListContainer,
  ProductListItem,
  ProductListItemButton,
  SubmitButton,
} from './stripePaymentForm.styles';

interface StripePaymentFormFields extends PaymentFormFields {
  product: TestProduct;
}

export interface StripePaymentFormProps {
  onSuccess(paymentIntent: StripePaymentIntent): void;
}

export const StripePaymentForm = ({ onSuccess }: StripePaymentFormProps) => {
  const intl = useIntl();
  const { updateOrCreatePaymentIntent } = useStripePaymentIntent();
  const { confirmPayment } = useStripePayment();

  const apiFormControls = useApiForm<StripePaymentFormFields>({
    mode: 'onChange',
  });
  const { register, handleSubmit, errors, setApiResponse, setGenericError, formState, watch } = apiFormControls;
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

      <StripePaymentMethodSelector formControls={apiFormControls} />

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
