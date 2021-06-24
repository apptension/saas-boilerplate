import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Input } from '../../input';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { useApiForm } from '../../../hooks/useApiForm';
import { changePassword } from '../../../../modules/auth/auth.actions';
import { snackbarActions } from '../../../../modules/snackbar';
import { Container, ErrorMessage, SubmitButton, FormFieldsRow } from './changePasswordForm.styles';

type ChangePasswordFormFields = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export const ChangePasswordForm = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const dispatchWithPromise = useAsyncDispatch();
  const {
    register,
    handleSubmit,
    errors,
    genericError,
    setApiResponse,
    getValues,
    reset,
  } = useApiForm<ChangePasswordFormFields>({
    errorMessages: {
      oldPassword: {
        wrong_password: intl.formatMessage({
          defaultMessage: 'The password is invalid.',
          description: 'Auth / Change password / wrong old password',
        }),
      },
      newPassword: {
        password_too_common: intl.formatMessage({
          defaultMessage: 'The password is too common.',
          description: 'Auth / Change password / password too common',
        }),
        password_entirely_numeric: intl.formatMessage({
          defaultMessage: "The password can't be entirely numeric.",
          description: 'Auth / Change password / password entirely numeric',
        }),
      },
    },
  });

  const onChangePassword = async ({ oldPassword, newPassword }: ChangePasswordFormFields) => {
    try {
      const res = await dispatchWithPromise(changePassword({ oldPassword, newPassword }));
      setApiResponse(res);
      if (!res.isError) {
        reset();
        dispatch(
          snackbarActions.showMessage(
            intl.formatMessage({
              defaultMessage: 'Password successfully changed.',
              description: 'Auth / Change password / Success message',
            })
          )
        );
      }
    } catch {}
  };

  return (
    <Container onSubmit={handleSubmit(onChangePassword)}>
      <FormFieldsRow>
        <Input
          name={'oldPassword'}
          type={'password'}
          ref={register({
            required: {
              value: true,
              message: intl.formatMessage({
                defaultMessage: 'Old password is required',
                description: 'Auth / Change password / Old password required',
              }),
            },
          })}
          label={intl.formatMessage({
            defaultMessage: 'Old password',
            description: 'Auth / Change password / Old password placeholder',
          })}
          error={errors.oldPassword?.message}
        />
      </FormFieldsRow>

      <FormFieldsRow>
        <Input
          ref={register({
            required: {
              value: true,
              message: intl.formatMessage({
                defaultMessage: 'New password is required',
                description: 'Auth / Change password / Password required',
              }),
            },
            minLength: {
              value: 8,
              message: intl.formatMessage({
                defaultMessage: 'Password is too short. It must contain at least 8 characters.',
                description: 'Auth / Change password / Password too short',
              }),
            },
          })}
          name={'newPassword'}
          type={'password'}
          label={intl.formatMessage({
            defaultMessage: 'New password',
            description: 'Auth / Change password / New password label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Minimum 8 characters',
            description: 'Auth / Change password / New password placeholder',
          })}
          error={errors.newPassword?.message}
        />
      </FormFieldsRow>

      <FormFieldsRow>
        <Input
          ref={register({
            validate: {
              required: (value) =>
                value?.length > 0 ||
                intl.formatMessage({
                  defaultMessage: 'Confirm password is required',
                  description: 'Auth / Change password / Confirm password required',
                }),
              mustMatch: (value) =>
                getValues().newPassword === value ||
                intl.formatMessage({
                  defaultMessage: 'Passwords must match',
                  description: 'Auth / Change password / Password must match',
                }),
            },
          })}
          name={'confirmNewPassword'}
          type={'password'}
          label={intl.formatMessage({
            defaultMessage: 'Confirm new password',
            description: 'Auth / Change password / Confirm new password label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Minimum 8 characters',
            description: 'Auth / Change password / Confirm new password placeholder',
          })}
          error={errors.confirmNewPassword?.message}
        />
      </FormFieldsRow>
      {Object.keys(errors).length === 0 && genericError && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton>
        <FormattedMessage defaultMessage="Change password" description="Auth / Change password / Submit button" />
      </SubmitButton>
    </Container>
  );
};
