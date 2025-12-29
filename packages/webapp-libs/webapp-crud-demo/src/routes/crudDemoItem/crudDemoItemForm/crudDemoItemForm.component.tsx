import { Button, ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { Form, FormControl, FormField, FormItem, Input } from '@sb/webapp-core/components/forms';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../config/routes';
import { useCrudDemoItemForm } from './crudDemoItemForm.hook';

const MAX_NAME_LENGTH = 255;

export type CrudDemoItemFormFields = {
  name: string;
};

export type CrudDemoItemFormProps = {
  onSubmit: (formData: CrudDemoItemFormFields) => void;
  loading: boolean;
  initialData?: CrudDemoItemFormFields | null;
  error?: Error;
};

export const CrudDemoItemForm = ({ initialData, onSubmit, error, loading }: CrudDemoItemFormProps) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();

  const {
    form: {
      register,
      formState: { errors },
    },
    form,
    genericError,
    hasGenericErrorOnly,
    handleFormSubmit,
  } = useCrudDemoItemForm({ initialData, onSubmit, error });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6" onSubmit={handleFormSubmit}>
        <FormField
          control={form.control}
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
                        id: 'CrudDemoItem form / Name max length error',
                      }),
                    },
                    required: {
                      value: true,
                      message: intl.formatMessage({
                        defaultMessage: 'Name is required',
                        id: 'CrudDemoItem form / Name required',
                      }),
                    },
                  })}
                  label={intl.formatMessage({
                    defaultMessage: 'Name:',
                    id: 'CrudDemoItem Form / Name label',
                  })}
                  placeholder={intl.formatMessage({
                    defaultMessage: 'Name',
                    id: 'CrudDemoItem form / Name placeholder',
                  })}
                  error={errors.name?.message}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {hasGenericErrorOnly && (
          <div className="text-sm text-destructive">
            <span>{genericError}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end mt-6">
          <Link
            to={generateLocalePath(RoutesConfig.crudDemoItem.list)}
            variant={ButtonVariant.SECONDARY}
            className="w-full sm:w-fit"
          >
            <FormattedMessage defaultMessage="Cancel" id="CrudDemoItem form / Cancel button" />
          </Link>

          <Button type="submit" disabled={loading} className="w-full sm:w-fit">
            <FormattedMessage defaultMessage="Save changes" id="CrudDemoItem form / Submit button" />
          </Button>
        </div>
      </form>
    </Form>
  );
};
