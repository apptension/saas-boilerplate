import { ApolloError } from '@apollo/client';
import { Button, ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { Form, FormControl, FormField, FormItem, Input } from '@sb/webapp-core/components/forms';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
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
};

export const TenantForm = ({ initialData, onSubmit, error, loading }: TenantFormProps) => {
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

        {hasGenericErrorOnly && <span className="absolute text-red-500">{genericError}</span>}

        <div className="mt-6">
          <Link className="mr-4" to={generateLocalePath(RoutesConfig.home)} variant={ButtonVariant.SECONDARY}>
            <FormattedMessage defaultMessage="Cancel" id="Tenant form / Cancel button" />
          </Link>

          <Button type="submit" disabled={loading}>
            <FormattedMessage defaultMessage="Save changes" id="Tenant form / Submit button" />
          </Button>
        </div>
      </form>
    </Form>
  );
};
