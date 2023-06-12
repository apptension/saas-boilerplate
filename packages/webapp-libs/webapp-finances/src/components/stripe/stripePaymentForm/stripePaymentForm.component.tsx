import { StripePaymentIntentType } from '@sb/webapp-api-client';
import { Button } from '@sb/webapp-core/components/buttons';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { FormattedMessage, useIntl } from 'react-intl';

import { TestProduct } from '../../../types';
import { useStripePaymentForm } from '../stripePayment.hooks';
import { StripePaymentMethodSelector } from '../stripePaymentMethodSelector';
import {
  ErrorMessage,
  Form,
  Heading,
  ProductListContainer,
  ProductListItem,
  ProductListItemButton,
  StripePaymentFormContainer,
} from './stripePaymentForm.styles';

export type StripePaymentFormProps = {
  onSuccess: (paymentIntent: StripePaymentIntentType) => void;
};

export const StripePaymentForm = ({ onSuccess }: StripePaymentFormProps) => {
  const intl = useIntl();
  const { onSubmit, apiFormControls, loading } = useStripePaymentForm(onSuccess);

  const {
    form: {
      register,
      formState: { errors },
      formState,
      watch,
    },
  } = apiFormControls;

  const amountValue = watch('product');

  return (
    <Form
      onSubmit={(e) => {
        onSubmit(e).catch(reportError);
      }}
    >
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

      <Button
        type="submit"
        disabled={!formState.isValid || formState.isSubmitting || loading}
        className="mt-2 w-full max-w-none"
      >
        <FormattedMessage
          values={{ amount: amountValue ? `${amountValue} USD` : '' }}
          defaultMessage="Pay {amount}"
          id="Stripe / payment form / pay CTA"
        />
      </Button>
    </Form>
  );
};
