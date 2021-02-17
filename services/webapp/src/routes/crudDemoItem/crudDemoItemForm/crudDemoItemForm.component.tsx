import React, { ReactNode } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { useApiForm } from '../../../shared/hooks/useApiForm';
import { Input } from '../../../shared/components/input';
import { Button } from '../../../shared/components/button';
import { CrudDemoItem } from '../../../shared/services/api/crudDemoItem/types';
import { crudDemoItemActions } from '../../../modules/crudDemoItem';
import { Container, ErrorMessage, Label, Form, Row, Value } from './crudDemoItemForm.styles';

export interface CrudDemoItemFormProps {
  data?: CrudDemoItem;
}

interface CrudDemoItemFormFields {
  name: string;
}

export const CrudDemoItemForm = ({ data }: CrudDemoItemFormProps) => {
  const intl = useIntl();
  const dispatch = useAsyncDispatch();

  const {
    register,
    handleSubmit,
    errors,
    genericError,
    setApiResponse,
    formState,
  } = useApiForm<CrudDemoItemFormFields>({
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
    } catch {}
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Row>
          <Label>
            <FormattedMessage defaultMessage="Name:" description="CrudDemoItem Form / Name label" />
          </Label>
          <Input
            ref={register({
              required: {
                value: true,
                message: intl.formatMessage({
                  defaultMessage: 'Name is required',
                  description: 'CrudDemoItem form / Name required',
                }),
              },
            })}
            name={'name'}
            placeholder={intl.formatMessage({
              defaultMessage: 'Name',
              description: 'CrudDemoItem form / Name placeholder',
            })}
            error={errors.name?.message}
          />
        </Row>

        {genericError && <ErrorMessage>{genericError}</ErrorMessage>}
        <Button type="submit">
          <FormattedMessage defaultMessage="Save" description="CrudDemoItem form / Submit button" />
        </Button>

        {formState.isSubmitSuccessful && (
          <FormattedMessage defaultMessage="Saved successfully" description="CrudDemoItem form / Success message" />
        )}
      </Form>
    </Container>
  );
};
