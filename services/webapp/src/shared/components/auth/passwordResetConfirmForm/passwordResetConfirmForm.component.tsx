import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { useApiForm } from '../../../hooks/useApiForm';
import { confirmPasswordReset } from '../../../../modules/auth/auth.actions';
import { Input } from '../../input';
import { FormFieldsRow } from '../../../../theme/size';
import { snackbarActions } from '../../../../modules/snackbar';
import { useGenerateLocalePath } from '../../../../routes/useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../../../routes/app.constants';
import { Container, ErrorMessage, SubmitButton } from './passwordResetConfirmForm.styles';

export interface PasswordResetConfirmFormProps {
  user: string;
  token: string;
}

interface ResetPasswordFormFields {
  newPassword: string;
  confirmPassword: string;
}

export const PasswordResetConfirmForm = ({ user, token }: PasswordResetConfirmFormProps) => {
  const intl = useIntl();
  const dispatchWithPromise = useAsyncDispatch();
  const dispatch = useDispatch();
  const history = useHistory();
  const generateLocalePath = useGenerateLocalePath();
  const {
    register,
    handleSubmit,
    errors,
    genericError,
    setApiResponse,
    getValues,
  } = useApiForm<ResetPasswordFormFields>({
    errorMessages: {
      nonFieldErrors: {
        invalid_token: intl.formatMessage({
          defaultMessage: 'Malformed password reset token',
          description: 'Auth / Reset password confirm / invalid token',
        }),
      },
      newPassword: {
        password_too_common: intl.formatMessage({
          defaultMessage: 'The password is too common.',
          description: 'Auth / Reset password confirm / password too common',
        }),
        password_entirely_numeric: intl.formatMessage({
          defaultMessage: "The password can't be entirely numeric.",
          description: 'Auth / Reset password confirm / password entirely numeric',
        }),
      },
    },
  });

  const onResetPassword = async (data: ResetPasswordFormFields) => {
    try {
      const res = await dispatchWithPromise(
        confirmPasswordReset({
          newPassword: data.newPassword,
          user,
          token,
        })
      );
      setApiResponse(res);

      if (!res.isError) {
        history.push(generateLocalePath(ROUTES.login));
        dispatch(
          snackbarActions.showMessage(
            intl.formatMessage({
              defaultMessage: '🎉 Password reset successfully!',
              description: 'Auth / Reset password confirm / Success message',
            })
          )
        );
      }
    } catch {}
  };

  return (
    <Container onSubmit={handleSubmit(onResetPassword)}>
      <FormFieldsRow>
        <Input
          name={'newPassword'}
          type={'password'}
          ref={register({
            required: {
              value: true,
              message: intl.formatMessage({
                defaultMessage: 'Password is required',
                description: 'Auth / Reset password confirm / Old password required',
              }),
            },
            minLength: {
              value: 8,
              message: intl.formatMessage({
                defaultMessage: 'Password is too short. It must contain at least 8 characters.',
                description: 'Auth / Reset password confirm / Password too short',
              }),
            },
          })}
          required
          label={intl.formatMessage({
            defaultMessage: 'New password',
            description: 'Auth / Reset password confirm / Password label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Write new password here...',
            description: 'Auth / Reset password confirm / Password placeholder',
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
                  defaultMessage: 'Repeat new password is required',
                  description: 'Auth / Reset password confirm / Password required',
                }),
              mustMatch: (value) =>
                getValues().newPassword === value ||
                intl.formatMessage({
                  defaultMessage: 'Passwords must match',
                  description: 'Auth / Reset password confirm / Password must match',
                }),
            },
          })}
          name={'confirmPassword'}
          type={'password'}
          required
          label={intl.formatMessage({
            defaultMessage: 'Repeat new password',
            description: 'Auth / Login / Confirm password label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Confirm your new password here...',
            description: 'Auth / Login / Confirm password placeholder',
          })}
          error={errors.confirmPassword?.message}
        />
      </FormFieldsRow>

      {Object.keys(errors).length === 0 && genericError && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton>
        <FormattedMessage
          defaultMessage="Confirm the change"
          description="Auth / Reset password confirm / Submit button"
        />
      </SubmitButton>
    </Container>
  );
};
