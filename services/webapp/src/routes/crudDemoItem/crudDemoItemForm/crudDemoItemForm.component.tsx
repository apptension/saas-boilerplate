import { FormattedMessage, useIntl } from 'react-intl';
import { PayloadError } from 'relay-runtime';
import { useApiForm } from '../../../shared/hooks/useApiForm';
import { Input } from '../../../shared/components/input';
import { Button, ButtonVariant } from '../../../shared/components/button';
import { Link } from '../../../shared/components/link';
import { useGenerateLocalePath } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { useSnackbar } from '../../../shared/components/snackbar';
import { Buttons, Container, ErrorMessage, Fields, Form } from './crudDemoItemForm.styles';

const MAX_NAME_LENGTH = 255;

export type CrudDemoItemFormFields = {
  name: string;
};

export type CrudDemoItemFormProps = {
  initialData?: CrudDemoItemFormFields | null;
  onSubmit: (formData: CrudDemoItemFormFields) => Promise<{ errors?: PayloadError[] | null }>;
};

export const CrudDemoItemForm = ({ initialData, onSubmit }: CrudDemoItemFormProps) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const { showMessage } = useSnackbar();

  const successMessage = intl.formatMessage({
    description: 'CrudDemoItem form / Success message',
    defaultMessage: '🎉 Changes saved successfully!',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    genericError,
    hasGenericErrorOnly,
    setGraphQLResponseErrors,
  } = useApiForm<CrudDemoItemFormFields>({
    defaultValues: {
      name: initialData?.name,
    },
  });

  const onFormSubmit = async (formData: CrudDemoItemFormFields) => {
    const { errors } = await onSubmit(formData);
    if (errors) {
      setGraphQLResponseErrors(errors);
    } else {
      await showMessage(successMessage);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Fields>
          <Input
            {...register('name', {
              maxLength: {
                value: MAX_NAME_LENGTH,
                message: intl.formatMessage({
                  defaultMessage: 'Name is too long',
                  description: 'CrudDemoItem form / Name max length error',
                }),
              },
              required: {
                value: true,
                message: intl.formatMessage({
                  defaultMessage: 'Name is required',
                  description: 'CrudDemoItem form / Name required',
                }),
              },
            })}
            label={intl.formatMessage({
              defaultMessage: 'Name:',
              description: 'CrudDemoItem Form / Name label',
            })}
            placeholder={intl.formatMessage({
              defaultMessage: 'Name',
              description: 'CrudDemoItem form / Name placeholder',
            })}
            error={errors.name?.message}
          />

          {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}
        </Fields>

        <Buttons>
          <Link to={generateLocalePath(ROUTES.crudDemoItem.list)} variant={ButtonVariant.SECONDARY}>
            <FormattedMessage defaultMessage="Cancel" description="CrudDemoItem form / Cancel button" />
          </Link>

          <Button type="submit">
            <FormattedMessage defaultMessage="Save changes" description="CrudDemoItem form / Submit button" />
          </Button>
        </Buttons>
      </Form>
    </Container>
  );
};
