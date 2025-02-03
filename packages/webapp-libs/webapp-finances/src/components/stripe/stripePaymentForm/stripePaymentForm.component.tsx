import { StripePaymentIntentType } from '@sb/webapp-api-client';
import { Button } from '@sb/webapp-core/components/buttons';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@sb/webapp-core/components/forms';
import { RadioGroup, RadioGroupItem } from '@sb/webapp-core/components/ui/radio-group';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { FormattedMessage, useIntl } from 'react-intl';

import { TestProduct } from '../../../types';
import { useStripePaymentForm } from '../stripePayment.hooks';
import { StripePaymentMethodSelector } from '../stripePaymentMethodSelector';

export type StripePaymentFormProps = {
  onSuccess: (paymentIntent: StripePaymentIntentType) => void;
};

export const StripePaymentForm = ({ onSuccess }: StripePaymentFormProps) => {
  const intl = useIntl();
  const {
    onSubmit,
    apiFormControls: { form, hasGenericErrorOnly, genericError },
    loading,
  } = useStripePaymentForm(onSuccess);

  const amountValue = form.watch('product');

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={(e) => {
          onSubmit(e).catch(reportError);
        }}
        className="space-y-8"
      >
        <FormField
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <FormattedMessage defaultMessage="Choose the amount" id="Stripe / payment form / product label" />
              </FormLabel>
              <FormDescription>
                <FormattedMessage
                  defaultMessage="Select amount you would like to donate"
                  id="Stripe / payment form / product description"
                />
              </FormDescription>

              <FormMessage />

              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid max-w-md grid-cols-3 gap-8 pt-2"
              >
                {Object.values(TestProduct).map((amount) => (
                  <FormItem key={amount}>
                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                      <FormControl>
                        <RadioGroupItem value={amount} className="sr-only" />
                      </FormControl>
                      <div className="flex justify-center items-center rounded-md border-2 border-muted p-1 aspect-square cursor-pointer font-semibold text-lg">
                        ${amount}
                      </div>
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormItem>
          )}
          name="product"
          rules={{
            required: {
              value: true,
              message: intl.formatMessage({
                defaultMessage: 'Product is required',
                id: 'Stripe / Payment / Product required',
              }),
            },
          }}
        />

        <div className="mt-3">
          <StripePaymentMethodSelector control={form.control} />
        </div>

        {hasGenericErrorOnly && <div className="text-red-500">{genericError}</div>}

        <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting || loading}>
          <FormattedMessage
            values={{ amount: amountValue ? `${amountValue} USD` : '' }}
            defaultMessage="Pay {amount}"
            id="Stripe / payment form / pay CTA"
          />
        </Button>
      </form>
    </Form>
  );
};
