import { ApolloError } from '@apollo/client';
import { Button, ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { Form, FormControl, FormField, FormItem, Input } from '@sb/webapp-core/components/forms';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useTenantForm } from './tenantForm.hook';

const MAX_NAME_LENGTH = 255;

export type TenantFormFields = {
  name: string;
};

export type TenantFormProps = {
  initialData?: TenantFormFields | null;
  onSubmit: (formData: TenantFormFields) => void;
  loading: boolean;
  error?: ApolloError;
  /** Custom submit button label, defaults to "Save changes" */
  submitLabel?: ReactNode;
  /** Custom cancel URL, defaults to home route */
  cancelUrl?: string;
  /** Hide cancel button */
  hideCancel?: boolean;
};

export const TenantForm = ({
  initialData,
  onSubmit,
  error,
  loading,
  submitLabel,
  cancelUrl,
  hideCancel,
}: TenantFormProps) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();

  const {
    form: {
      register,
      formState: { errors },
      control,
    },
    form,
    genericError,
    hasGenericErrorOnly,
    handleFormSubmit,
  } = useTenantForm({ initialData, onSubmit, error });

  const defaultCancelUrl = generateLocalePath(RoutesConfig.home);

  return (
    <Form {...form}>
      <form className="flex flex-col" onSubmit={handleFormSubmit}>
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  {...register('name', {
                    maxLength: {
                      value: MAX_NAME_LENGTH,
                      message: intl.formatMessage({
                        defaultMessage: 'Name is too long',
                        id: 'Tenant form / Name max length error',
                      }),
                    },
                    required: {
                      value: true,
                      message: intl.formatMessage({
                        defaultMessage: 'Name is required',
                        id: 'Tenant form / Name required',
                      }),
                    },
                  })}
                  label={intl.formatMessage({
                    defaultMessage: 'Name:',
                    id: 'Tenant Form / Name label',
                  })}
                  placeholder={intl.formatMessage({
                    defaultMessage: 'Name',
                    id: 'Tenant form / Name placeholder',
                  })}
                  error={errors.name?.message}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {hasGenericErrorOnly && (
          <div className="mt-4 text-sm text-destructive">
            <span>{genericError}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {!hideCancel && (
            <Link
              to={cancelUrl ?? defaultCancelUrl}
              variant={ButtonVariant.SECONDARY}
              className="w-full sm:w-fit"
            >
              <FormattedMessage defaultMessage="Cancel" id="Tenant form / Cancel button" />
            </Link>
          )}

          <Button type="submit" disabled={loading} className="w-full sm:w-fit">
            {submitLabel ?? (
              <FormattedMessage defaultMessage="Save changes" id="Tenant form / Submit button" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
