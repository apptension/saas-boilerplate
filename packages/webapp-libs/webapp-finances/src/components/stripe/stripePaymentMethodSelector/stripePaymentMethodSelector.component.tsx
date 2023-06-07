import { useQuery } from '@apollo/client';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { StripeSubscriptionQueryQuery } from '@sb/webapp-api-client';
import { Icon } from '@sb/webapp-core/components/icons';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { isEmpty } from 'ramda';
import { Control, PathValue, useController } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

import { useStripePaymentMethods } from '../stripePayment.hooks';
import { StripePaymentMethodInfo } from '../stripePaymentMethodInfo';
import { NewCardInput } from './methods';
import { stripeSubscriptionQuery } from './stripePaymentMethodSelector.graphql';
import {
  CardElementContainer,
  Container,
  DeleteButton,
  ExistingPaymentMethodItem,
  Heading,
  NewPaymentMethodItem,
  PaymentMethodList,
  PaymentMethodListItem,
} from './stripePaymentMethodSelector.styles';
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
  const { data, loading } = useQuery(stripeSubscriptionQuery, {
    fetchPolicy: 'cache-and-network',
  });

  if (loading) {
    return (
      <span>
        <FormattedMessage defaultMessage="Loading..." id="Loading message" />
      </span>
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

  return (
    <Container>
      <Heading>
        {isEmpty(paymentMethods) ? (
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
      </Heading>

      <PaymentMethodList>
        {paymentMethods.map((paymentMethod) => {
          return (
            <PaymentMethodListItem key={paymentMethod.id}>
              <ExistingPaymentMethodItem
                checked={isExistingMethodSelected(paymentMethod.id)}
                value={paymentMethod.id}
                onChange={() => handleExistingSelected(paymentMethod)}
              >
                <StripePaymentMethodInfo method={paymentMethod} />
                <DeleteButton onClick={(e) => handleDelete(paymentMethod.id)}>
                  <Icon size={16} icon={deleteIcon} />
                </DeleteButton>
              </ExistingPaymentMethodItem>
            </PaymentMethodListItem>
          );
        })}

        {paymentMethods?.length > 0 && (
          <PaymentMethodListItem>
            <NewPaymentMethodItem
              type="button"
              isSelected={typeController.field.value === StripePaymentMethodSelectionType.NEW_CARD}
              onClick={handleNewCardSelected}
            >
              <FormattedMessage
                defaultMessage="Add a new card"
                id="Stripe / payment method selector / new card option"
              />
            </NewPaymentMethodItem>
          </PaymentMethodListItem>
        )}
      </PaymentMethodList>

      {typeController.field.value === StripePaymentMethodSelectionType.NEW_CARD && (
        <CardElementContainer>
          <NewCardInput control={control} />
        </CardElementContainer>
      )}
    </Container>
  );
};
