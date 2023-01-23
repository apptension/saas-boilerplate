import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { StripeElementChangeEvent } from '@stripe/stripe-js';
import { Controller } from 'react-hook-form';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { isEmpty } from 'ramda';

import { StripeCardForm } from '../stripeCardForm';
import { useStripePaymentMethods } from '../stripePayment.hooks';
import { StripePaymentMethodInfo } from '../stripePaymentMethodInfo';
import { Icon } from '../../../icon';
import { ApiFormReturnType } from '../../../../hooks/useApiForm';
import stripeAllPaymentMethodsQueryGraphql, {
  stripeAllPaymentMethodsQuery,
} from '../../../../../modules/stripe/__generated__/stripeAllPaymentMethodsQuery.graphql';
import { stripePaymentMethodFragment$data } from '../../../../../modules/stripe/__generated__/stripePaymentMethodFragment.graphql';
import { mapConnection } from '../../../../utils/graphql';
import {
  PaymentFormFields,
  StripePaymentMethodChangeEvent,
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from './stripePaymentMethodSelector.types';
import {
  CardElementContainer,
  Container,
  DeleteButton,
  ErrorMessage,
  ExistingPaymentMethodItem,
  Heading,
  NewPaymentMethodItem,
  PaymentMethodList,
  PaymentMethodListItem,
} from './stripePaymentMethodSelector.styles';

export type StripePaymentMethodSelectorContentProps<T extends PaymentFormFields = PaymentFormFields> = {
  formControls: ApiFormReturnType<T>;
  initialValue?: stripePaymentMethodFragment$data | null;
  allPaymentMethodsQueryRef: PreloadedQuery<stripeAllPaymentMethodsQuery>;
};

export const StripePaymentMethodSelectorContent = <T extends PaymentFormFields = PaymentFormFields>({
  formControls: {
    form: {
      control,
      formState: { errors },
    },
    genericError,
    hasGenericErrorOnly,
  },
  initialValue,
  allPaymentMethodsQueryRef,
}: StripePaymentMethodSelectorContentProps<T>) => {
  const intl = useIntl();

  const { allPaymentMethods } = usePreloadedQuery(stripeAllPaymentMethodsQueryGraphql, allPaymentMethodsQueryRef);

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

    const savedPaymentMethod = initialValue && paymentMethods.find((method) => method.id === initialValue.id);
    if (savedPaymentMethod) {
      return {
        type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
        data: savedPaymentMethod as unknown as stripePaymentMethodFragment$data,
      };
    }

    return {
      type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
      data: paymentMethods[0] as unknown as stripePaymentMethodFragment$data,
    };
  }, [paymentMethods, initialValue]);

  return (
    <Controller<PaymentFormFields, 'paymentMethod'>
      name="paymentMethod"
      control={control as any}
      defaultValue={defaultValue}
      rules={{
        required: true,
        validate: (value) => {
          if (value.type === StripePaymentMethodSelectionType.NEW_CARD) {
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
          }

          return true;
        },
      }}
      render={({ field: { onChange, value } }) => {
        const handleChange = (event: StripePaymentMethodChangeEvent) => {
          if (event.type !== StripePaymentMethodSelectionType.NEW_CARD) {
            onChange(event);
            return;
          }

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

          if (event.data?.elementType === 'name') {
            onChange({ type: event.type, data: { ...data, name: event.data.value } });
          } else if (typeof event.data?.elementType === 'string') {
            const stripeFieldData = event.data as StripeElementChangeEvent;
            const fieldName = event.data.elementType;
            const cardErrors = (value?.data as any)?.cardErrors ?? {};

            onChange({
              type: event.type,
              data: {
                ...data,
                cardErrors: { ...cardErrors, [fieldName]: stripeFieldData?.error },
                cardMissingFields: {
                  ...data.cardMissingFields,
                  [fieldName]: !!stripeFieldData?.empty,
                },
              },
            });
          } else {
            onChange({ type: event.type, data });
          }
        };

        const handleMethodRemoved = (id: string) => {
          if (paymentMethods.length === 1) {
            handleChange({
              type: StripePaymentMethodSelectionType.NEW_CARD,
              data: null,
            });
          } else if ((value.data as any).id === id) {
            handleChange({
              type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
              data: paymentMethods.filter(
                (method) => method.id !== id
              )[0] as unknown as stripePaymentMethodFragment$data,
            });
          }
          deletePaymentMethod(id);
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
                const isSelected =
                  value.type === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD &&
                  paymentMethod.id === value.data.id;

                return (
                  <PaymentMethodListItem key={paymentMethod.id}>
                    <ExistingPaymentMethodItem
                      checked={isSelected}
                      value={paymentMethod.id}
                      onChange={() => {
                        handleChange({
                          type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
                          data: paymentMethod as unknown as stripePaymentMethodFragment$data,
                        });
                      }}
                    >
                      <StripePaymentMethodInfo method={paymentMethod} />
                      <DeleteButton
                        onClick={(e) => {
                          e.preventDefault();
                          if (paymentMethod.pk) {
                            handleMethodRemoved(paymentMethod.pk);
                          }
                        }}
                      >
                        <Icon size={16} icon={deleteIcon} />
                      </DeleteButton>
                    </ExistingPaymentMethodItem>
                  </PaymentMethodListItem>
                );
              })}

              {paymentMethods?.length > 0 && (
                <PaymentMethodListItem>
                  <NewPaymentMethodItem
                    isSelected={value.type === StripePaymentMethodSelectionType.NEW_CARD}
                    onClick={() => {
                      handleChange({
                        type: StripePaymentMethodSelectionType.NEW_CARD,
                        data: null,
                      });
                    }}
                  >
                    <FormattedMessage
                      defaultMessage="Add a new card"
                      id="Stripe / payment method selector / new card option"
                    />
                  </NewPaymentMethodItem>
                </PaymentMethodListItem>
              )}
            </PaymentMethodList>

            {value?.type === StripePaymentMethodSelectionType.NEW_CARD && (
              <CardElementContainer>
                <StripeCardForm onChange={handleChange} />
              </CardElementContainer>
            )}

            <ErrorMessage>{(errors.paymentMethod as any)?.message}</ErrorMessage>
            {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}
          </Container>
        );
      }}
    />
  );
};
