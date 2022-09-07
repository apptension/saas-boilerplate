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
  StripePaymentFormContainer,
} from './stripePaymentForm.styles';

type StripePaymentFormFields = PaymentFormFields & {
  product: TestProduct;
};

export type StripePaymentFormProps = {
  onSuccess(paymentIntent: StripePaymentIntent): void;
};

export const StripePaymentForm = ({ onSuccess }: StripePaymentFormProps) => {
  const intl = useIntl();
  const { updateOrCreatePaymentIntent } = useStripePaymentIntent();
  const { confirmPayment } = useStripePayment();

  const apiFormControls = useApiForm<StripePaymentFormFields>({
    mode: 'onChange',
  });
  const {
    form: {
      register,
      handleSubmit,
      formState: { errors },
      formState,
      watch,
    },
    setApiResponse,
    setGenericError,
  } = apiFormControls;
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
          <FormattedMessage defaultMessage="Choose the product" id="Stripe / payment form / product label" />
        </Heading>

        <ProductListContainer>
          {Object.values(TestProduct).map((amount) => (
            <ProductListItem key={amount}>
              <ProductListItemButton
                {...register('product', {
                  required: {
                    value: true,
                    message: intl.formatMessage({
                      defaultMessage: 'Product is required',
                      id: 'Stripe / Payment / Product required',
                    }),
                  },
                })}
                value={amount}
              >
                {amount} USD
              </ProductListItemButton>
            </ProductListItem>
          ))}
        </ProductListContainer>
        <ErrorMessage>{errors.product?.message}</ErrorMessage>
      </div>

      <StripePaymentFormContainer>
        <StripePaymentMethodSelector formControls={apiFormControls} />
      </StripePaymentFormContainer>

      <SubmitButton disabled={!formState.isValid || formState.isSubmitting}>
        <FormattedMessage
          values={{ amount: amountValue ? `${amountValue} USD` : '' }}
          defaultMessage="Pay {amount}"
          id="Stripe / payment form / pay CTA"
        />
      </SubmitButton>
    </Form>
  );
};
