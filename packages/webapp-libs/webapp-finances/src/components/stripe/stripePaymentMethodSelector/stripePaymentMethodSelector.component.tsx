import { useQuery } from '@apollo/client';
import { StripePaymentMethodFragmentFragment } from '@sb/webapp-api-client';
import { ApiFormReturnType } from '@sb/webapp-api-client/hooks';
import { Button, RadioButton } from '@sb/webapp-core/components/buttons';
import { FormItem, FormLabel, FormMessage } from '@sb/webapp-core/components/forms';
import { RadioGroup } from '@sb/webapp-core/components/forms/radioGroup';
import { Separator } from '@sb/webapp-core/components/separator';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { isEmpty } from 'ramda';
import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';

import { StripeCardForm } from '../stripeCardForm';
import { useStripePaymentMethods } from '../stripePayment.hooks';
import { StripePaymentMethodInfo } from '../stripePaymentMethodInfo';
import { stripeSubscriptionQuery } from './stripePaymentMethodSelector.graphql';
import {
  PaymentFormFields,
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from './stripePaymentMethodSelector.types';
import { changeHandler, methodRemovedHandler } from './stripePaymentMethodSelector.utils';

export type StripePaymentMethodSelectorProps<T extends PaymentFormFields> = {
  formControls: ApiFormReturnType<T>;
  initialValueId?: string;
};

export const StripePaymentMethodSelector = <T extends PaymentFormFields>(
  props: StripePaymentMethodSelectorProps<T>
) => {
  const { data, loading } = useQuery(stripeSubscriptionQuery, {
    fetchPolicy: 'cache-and-network',
  });

  const {
    formControls: {
      form: { control },
      genericError,
      hasGenericErrorOnly,
    },
    initialValueId,
  } = props;
  const allPaymentMethods = data?.allPaymentMethods;

  const intl = useIntl();

  const paymentMethods = mapConnection((plan) => plan, allPaymentMethods);

  const { deletePaymentMethod } = useStripePaymentMethods();

  const defaultValue = useMemo<StripePaymentMethodSelection>(() => {
    if (isEmpty(paymentMethods)) {
      return {
        type: StripePaymentMethodSelectionType.NEW_CARD,
        data: {
          name: '',
          cardErrors: {},
          cardMissingFields: {},
        },
      };
    }

    const savedPaymentMethod = initialValueId && paymentMethods.find((method) => method.id === initialValueId);

    return {
      type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
      data: savedPaymentMethod || paymentMethods[0],
    };
  }, [paymentMethods, initialValueId]);

  if (loading)
    return (
      <span>
        <FormattedMessage defaultMessage="Loading..." id="Loading message" />
      </span>
    );

  return (
    <Controller<PaymentFormFields, 'paymentMethod'>
      name="paymentMethod"
      control={control as any}
      defaultValue={defaultValue}
      rules={{
        required: true,
        validate: (value) => {
          if (value.type !== StripePaymentMethodSelectionType.NEW_CARD) return true;

          const anyFieldMissing = Object.values(value.data.cardMissingFields ?? {}).some((isMissing) => isMissing);
          const fieldError = Object.values(value.data.cardErrors ?? {}).filter((error) => !!error)[0];

          if (fieldError) {
            return fieldError.message;
          }

          if (value.data === null || anyFieldMissing) {
            return intl.formatMessage({
              defaultMessage: 'Payment method is required',
              id: 'Stripe / Payment / Method required',
            });
          }

          if (!value.data.name) {
            return intl.formatMessage({
              defaultMessage: 'Card name is required',
              id: 'Stripe / Payment / Card name required',
            });
          }

          return true;
        },
      }}
      render={({ field: { onChange, value } }) => {
        const handleChange = changeHandler(onChange, value);
        const handleMethodRemoved = methodRemovedHandler(onChange, value, paymentMethods, deletePaymentMethod);

        const handleCreateNewCard = () => {
          handleChange({
            type: StripePaymentMethodSelectionType.NEW_CARD,
            data: null,
          });
        };

        const handleBackToCardSelection = () => {
          handleChange({
            type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
            data: defaultValue.data as StripePaymentMethodFragmentFragment,
          });
        };

        const renderNewCardForm = () => (
          <div className="space-y-3">
            {!isEmpty(paymentMethods) ? (
              <Button size="sm" onClick={handleBackToCardSelection} variant="outline" icon={<ChevronLeft size={16} />}>
                <FormattedMessage
                  defaultMessage="Back to card list"
                  id="Stripe / payment method selector / back to card list"
                />
              </Button>
            ) : null}

            <StripeCardForm onChange={handleChange} />
          </div>
        );

        const renderCardSelection = () => (
          <>
            <RadioGroup
              defaultValue={
                value.type === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD ? value.data.id : undefined
              }
            >
              {paymentMethods.map((paymentMethod) => {
                return (
                  <RadioButton
                    key={paymentMethod.id}
                    value={paymentMethod.id}
                    onChange={() => {
                      handleChange({
                        type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
                        data: paymentMethod,
                      });
                    }}
                    className="w-full"
                  >
                    <span className="grow">
                      <StripePaymentMethodInfo method={paymentMethod} />
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        if (paymentMethod.pk) {
                          handleMethodRemoved(paymentMethod.pk);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </RadioButton>
                );
              })}
            </RadioGroup>
            <Separator />
            <span className="text-muted-foreground">
              <FormattedMessage defaultMessage="or" id="Stripe / payment method selector / or" />
            </span>
            <Button type="button" variant="link" onClick={handleCreateNewCard}>
              <FormattedMessage
                defaultMessage="Use a new card"
                id="Stripe / payment method selector / new card option"
              />
            </Button>
          </>
        );

        const isNewCardEnabled = value?.type === StripePaymentMethodSelectionType.NEW_CARD;
        return (
          <FormItem>
            <FormLabel>
              {isEmpty(paymentMethods) || isNewCardEnabled ? (
                <FormattedMessage
                  defaultMessage="Enter card details"
                  id="Stripe / payment method selector / enter card details"
                />
              ) : (
                <FormattedMessage
                  defaultMessage="Select payment method"
                  id="Stripe / payment method selector / select payment method"
                />
              )}
            </FormLabel>

            {isNewCardEnabled ? renderNewCardForm() : renderCardSelection()}

            <FormMessage />

            {hasGenericErrorOnly && <p className="mt-1 text-red-500">{genericError}</p>}
          </FormItem>
        );
      }}
    />
  );
};
