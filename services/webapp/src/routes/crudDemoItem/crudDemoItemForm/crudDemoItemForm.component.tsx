import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { useApiForm } from '../../../shared/hooks/useApiForm';
import { Input } from '../../../shared/components/input';
import { Button } from '../../../shared/components/button';
import { CrudDemoItem } from '../../../shared/services/api/crudDemoItem/types';
import { crudDemoItemActions } from '../../../modules/crudDemoItem';
import { ButtonVariant } from '../../../shared/components/button/button.types';
import { Link } from '../../../shared/components/link';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { useSnackbar } from '../../../shared/components/snackbar';
import { Buttons, Container, ErrorMessage, Fields, Form } from './crudDemoItemForm.styles';

const MAX_NAME_LENGTH = 255;

export interface CrudDemoItemFormProps {
  data?: CrudDemoItem;
}

interface CrudDemoItemFormFields {
  name: string;
}

export const CrudDemoItemForm = ({ data }: CrudDemoItemFormProps) => {
  const intl = useIntl();
  const dispatch = useAsyncDispatch();
  const goBackUrl = useLocaleUrl(ROUTES.crudDemoItem.list);
  const { showMessage } = useSnackbar();

  const successMessage = intl.formatMessage({
    description: 'CrudDemoItem form / Success message',
    defaultMessage: '🎉 Changes saved successfully!',
  });

  const { register, handleSubmit, errors, genericError, setApiResponse } = useApiForm<CrudDemoItemFormFields>({
    defaultValues: {
      name: data?.name,
    },
  });

  const onFormSubmit = async (formData: CrudDemoItemFormFields) => {
    try {
      const action = data
        ? crudDemoItemActions.updateCrudDemoItem({ id: data.id, ...formData })
        : crudDemoItemActions.addCrudDemoItem(formData);

      const res = await dispatch(action);
      setApiResponse(res);

      if (!res.isError) {
        await showMessage(successMessage);
      }
    } catch {}
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Fields>
          <Input
            ref={register({
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
            name={'name'}
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

          {Object.keys(errors).length === 0 && genericError && <ErrorMessage>{genericError}</ErrorMessage>}
        </Fields>

        <Buttons>
          <Link to={goBackUrl} variant={ButtonVariant.SECONDARY}>
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
