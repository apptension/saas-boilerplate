import { useQuery } from '@apollo/client';
import { StripeSubscriptionQueryQuery } from '@sb/webapp-api-client';
import { Button, RadioButton } from '@sb/webapp-core/components/buttons';
import { FormItem, FormLabel, FormMessage } from '@sb/webapp-core/components/forms';
import { RadioGroup } from '@sb/webapp-core/components/ui/radio-group';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { Skeleton } from '@sb/webapp-core/components/ui/skeleton';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { isEmpty } from 'ramda';
import { Control, PathValue, useController } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

import { useStripePaymentMethods } from '../stripePayment.hooks';
import { StripePaymentMethodInfo } from '../stripePaymentMethodInfo';
import { NewCardInput } from './methods';
import { stripeSubscriptionQuery } from './stripePaymentMethodSelector.graphql';
import { PaymentFormFields, StripePaymentMethodSelectionType } from './stripePaymentMethodSelector.types';

export type StripePaymentMethodSelectorProps<T extends PaymentFormFields> = {
  control: Control<T>;
  defaultSavedPaymentMethodId?: string;
};

/**
 * A complex input component that populates paymentMethod field of a react-hook-form form. It lists all saved
 * payment methods and also includes a form to add a new credit card using Stripe Elements.
 *
 * @param defaultSavedPaymentMethodId an id of a payment method that should be selected by default. Useful for example
 * when showing a list of payment methods where one is being used in a recurring subscription
 * @param control a react-hook-form Control object
 * @constructor
 */
export const StripePaymentMethodSelector = <T extends PaymentFormFields>({
  defaultSavedPaymentMethodId,
  control,
}: StripePaymentMethodSelectorProps<T>) => {
  const { data: currentTenant } = useCurrentTenant();
  const { data, loading } = useQuery(stripeSubscriptionQuery, {
    fetchPolicy: 'cache-and-network',
    variables: {
      tenantId: currentTenant?.id ?? '',
    },
    skip: !currentTenant?.id,
  });

  if (loading) {
    return (
      <div className="space-y-2 w-full">
        <Skeleton className="w-32 h-8" />
        <Skeleton className="w-full h-8" />
        <div className="flex w-full">
          <Skeleton className="w-full h-8" />
          <div className="w-[15%] flex ml-2">
            <Skeleton className="w-full h-8" />
            <Skeleton className="ml-2 w-full h-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <StripePaymentMethodSelectorInner
      data={data}
      control={control}
      defaultSavedPaymentMethodId={defaultSavedPaymentMethodId}
    />
  );
};

export type StripePaymentMethodSelectorInnerProps<T extends PaymentFormFields> = StripePaymentMethodSelectorProps<T> & {
  data?: StripeSubscriptionQueryQuery;
};

/**
 * This component is extracted from the StripePaymentMethodSelector to make sure the defaultValue of a
 * paymentMethod.type form field is set correctly after data is fetched from backend. It's not easy to change the
 * default value of a react-hook-form field dynamically, so we defer the first render of the controller.
 *
 * @param defaultSavedPaymentMethodId an id of a payment method that should be selected by default. Useful for example
 * when showing a list of payment methods where one is being used in a recurring subscription
 * @param data
 * @param control a react-hook-form Control object
 * @constructor
 */
export const StripePaymentMethodSelectorInner = <T extends PaymentFormFields>({
  defaultSavedPaymentMethodId,
  data,
  ...props
}: StripePaymentMethodSelectorInnerProps<T>) => {
  const control = props.control as unknown as Control<PaymentFormFields>;
  const paymentMethods = mapConnection((plan) => plan, data?.allPaymentMethods);
  const { deletePaymentMethod } = useStripePaymentMethods();

  const typeController = useController({
    name: 'paymentMethod.type',
    control,
    defaultValue: isEmpty(paymentMethods)
      ? StripePaymentMethodSelectionType.NEW_CARD
      : StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
  });

  const savedPaymentMethodController = useController({
    name: 'paymentMethod.savedPaymentMethod',
    control,
    defaultValue:
      (defaultSavedPaymentMethodId && paymentMethods.find((method) => method.id === defaultSavedPaymentMethodId)) ||
      paymentMethods[0],
  });

  const isExistingMethodSelected = (id: string) => {
    return (
      typeController.field.value === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD &&
      id === savedPaymentMethodController.field.value?.id
    );
  };

  const handleExistingSelected = (paymentMethod: PathValue<PaymentFormFields, 'paymentMethod.savedPaymentMethod'>) => {
    typeController.field.onChange(StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD);
    savedPaymentMethodController.field.onChange(paymentMethod);
  };

  const handleNewCardSelected = () => {
    typeController.field.onChange(StripePaymentMethodSelectionType.NEW_CARD);
  };

  const handleDelete = async (id: string) => {
    const deletedPaymentMethod = paymentMethods.find((paymentMethod) => paymentMethod.id === id);
    if (!deletedPaymentMethod?.pk) {
      return;
    }

    if (isExistingMethodSelected(id)) {
      if (paymentMethods.length === 1) {
        typeController.field.onChange(StripePaymentMethodSelectionType.NEW_CARD);
      } else {
        savedPaymentMethodController.field.onChange(paymentMethods.filter((method) => method.id !== id)[0]);
      }
    }

    await deletePaymentMethod(deletedPaymentMethod.pk);
  };

  const handleBackToCardSelection = () => {
    typeController.field.onChange(StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD);
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

      <NewCardInput control={control} />
    </div>
  );

  const renderCardSelection = () => (
    <>
      <RadioGroup
        defaultValue={
          typeController.field.value === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD
            ? savedPaymentMethodController.field.value?.id
            : undefined
        }
      >
        {paymentMethods.map((paymentMethod) => {
          return (
            <RadioButton
              key={paymentMethod.id}
              value={paymentMethod.id}
              onChange={() => {
                handleExistingSelected(paymentMethod);
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
                  handleDelete(paymentMethod.id);
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
      <Button type="button" variant="link" onClick={handleNewCardSelected}>
        <FormattedMessage defaultMessage="Use a new card" id="Stripe / payment method selector / new card option" />
      </Button>
    </>
  );

  const isNewCardEnabled = typeController.field.value === StripePaymentMethodSelectionType.NEW_CARD;
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
    </FormItem>
  );
};
