import React from 'react';

import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { selectProfile } from '../../../../modules/auth/auth.selectors';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { useApiForm } from '../../../hooks/useApiForm';
import { updateProfile } from '../../../../modules/auth/auth.actions';
import { Button } from '../../button';
import { Input } from '../../input';
import { Container, Label, Row, Value, ErrorMessage, Form } from './editProfileForm.styles';

interface UpdateProfileFormFields {
  firstName: string;
  lastName: string;
}

const FIRST_NAME_MAX_LENGTH = 40;
const LAST_NAME_MAX_LENGTH = 40;

export const EditProfileForm = () => {
  const intl = useIntl();
  const dispatch = useAsyncDispatch();
  const profile = useSelector(selectProfile);
  const {
    register,
    handleSubmit,
    errors,
    genericError,
    setApiResponse,
    formState,
  } = useApiForm<UpdateProfileFormFields>({
    defaultValues: {
      firstName: profile?.firstName,
      lastName: profile?.lastName,
    },
  });

  const onProfileUpdate = async (profile: UpdateProfileFormFields) => {
    try {
      const res = await dispatch(updateProfile(profile));
      setApiResponse(res);
    } catch {}
  };

  return (
    <Container>
      <Row>
        <Label>
          <FormattedMessage defaultMessage="Email:" description="Auth / Profile details / Email label" />
        </Label>
        <Value>{profile?.email}</Value>
      </Row>

      <Row>
        <Label>
          <FormattedMessage defaultMessage="Roles:" description="Auth / Profile details / Roles label" />
        </Label>
        <Value>{profile?.roles?.join(',')}</Value>
      </Row>

      <Form onSubmit={handleSubmit(onProfileUpdate)}>
        <Input
          ref={register({
            maxLength: {
              value: FIRST_NAME_MAX_LENGTH,
              message: intl.formatMessage({
                defaultMessage: 'First name is too long',
                description: 'Auth / Update profile/ First name max length error',
              }),
            },
          })}
          name={'firstName'}
          placeholder={intl.formatMessage({
            defaultMessage: 'First name',
            description: 'Auth / Update profile / First name placeholder',
          })}
          error={errors.firstName?.message}
        />

        <Input
          ref={register({
            maxLength: {
              value: LAST_NAME_MAX_LENGTH,
              message: intl.formatMessage({
                defaultMessage: 'Last name is too long',
                description: 'Auth / Update profile/ Last name max length error',
              }),
            },
          })}
          name={'lastName'}
          placeholder={intl.formatMessage({
            defaultMessage: 'Last name',
            description: 'Auth / Update profile / Last name placeholder',
          })}
          error={errors.lastName?.message}
        />

        {genericError && <ErrorMessage>{genericError}</ErrorMessage>}
        <Button type="submit">
          <FormattedMessage defaultMessage="Update profile" description="Auth / Update profile/ Submit button" />
        </Button>

        {formState.isSubmitSuccessful && (
          <FormattedMessage
            defaultMessage="Profile updated successfully"
            description="Auth / Update profile/ Success message"
          />
        )}
      </Form>
    </Container>
  );
};
