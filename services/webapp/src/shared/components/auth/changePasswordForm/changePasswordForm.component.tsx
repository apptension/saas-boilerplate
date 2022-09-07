import { FormattedMessage, useIntl } from 'react-intl';
import { Input } from '../../forms/input';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { useApiForm } from '../../../hooks/useApiForm';
import { changePassword } from '../../../../modules/auth/auth.actions';
import { useSnackbar } from '../../snackbar';
import { Container, ErrorMessage, SubmitButton, FormFieldsRow } from './changePasswordForm.styles';

type ChangePasswordFormFields = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export const ChangePasswordForm = () => {
  const intl = useIntl();
  const snackbar = useSnackbar();
  const dispatch = useAsyncDispatch();
  const {
    form: {
      formState: { errors },
      register,
      getValues,
      reset,
    },
    handleSubmit,
    genericError,
    setApiResponse,
    hasGenericErrorOnly,
  } = useApiForm<ChangePasswordFormFields>({
    errorMessages: {
      oldPassword: {
        wrong_password: intl.formatMessage({
          defaultMessage: 'The password is invalid.',
          id: 'Auth / Change password / wrong old password',
        }),
      },
      newPassword: {
        password_too_common: intl.formatMessage({
          defaultMessage: 'The password is too common.',
          id: 'Auth / Change password / password too common',
        }),
        password_entirely_numeric: intl.formatMessage({
          defaultMessage: "The password can't be entirely numeric.",
          id: 'Auth / Change password / password entirely numeric',
        }),
      },
    },
  });

  const onChangePassword = async ({ oldPassword, newPassword }: ChangePasswordFormFields) => {
    try {
      const res = await dispatch(changePassword({ oldPassword, newPassword }));
      setApiResponse(res);
      if (!res.isError) {
        reset();
        snackbar.showMessage(
          intl.formatMessage({
            defaultMessage: 'Password successfully changed.',
            id: 'Auth / Change password / Success message',
          })
        );
      }
    } catch {}
  };

  return (
    <Container onSubmit={handleSubmit(onChangePassword)}>
      <FormFieldsRow>
        <Input
          {...register('oldPassword', {
            required: {
              value: true,
              message: intl.formatMessage({
                defaultMessage: 'Old password is required',
                id: 'Auth / Change password / Old password required',
              }),
            },
          })}
          type="password"
          label={intl.formatMessage({
            defaultMessage: 'Old password',
            id: 'Auth / Change password / Old password placeholder',
          })}
          error={errors.oldPassword?.message}
        />
      </FormFieldsRow>

      <FormFieldsRow>
        <Input
          {...register('newPassword', {
            required: {
              value: true,
              message: intl.formatMessage({
                defaultMessage: 'New password is required',
                id: 'Auth / Change password / Password required',
              }),
            },
            minLength: {
              value: 8,
              message: intl.formatMessage({
                defaultMessage: 'Password is too short. It must contain at least 8 characters.',
                id: 'Auth / Change password / Password too short',
              }),
            },
          })}
          type="password"
          label={intl.formatMessage({
            defaultMessage: 'New password',
            id: 'Auth / Change password / New password label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Minimum 8 characters',
            id: 'Auth / Change password / New password placeholder',
          })}
          error={errors.newPassword?.message}
        />
      </FormFieldsRow>

      <FormFieldsRow>
        <Input
          {...register('confirmNewPassword', {
            validate: {
              required: (value) =>
                value?.length > 0 ||
                intl.formatMessage({
                  defaultMessage: 'Confirm password is required',
                  id: 'Auth / Change password / Confirm password required',
                }),
              mustMatch: (value) =>
                getValues().newPassword === value ||
                intl.formatMessage({
                  defaultMessage: 'Passwords must match',
                  id: 'Auth / Change password / Password must match',
                }),
            },
          })}
          type="password"
          label={intl.formatMessage({
            defaultMessage: 'Confirm new password',
            id: 'Auth / Change password / Confirm new password label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Minimum 8 characters',
            id: 'Auth / Change password / Confirm new password placeholder',
          })}
          error={errors.confirmNewPassword?.message}
        />
      </FormFieldsRow>
      {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton>
        <FormattedMessage defaultMessage="Change password" id="Auth / Change password / Submit button" />
      </SubmitButton>
    </Container>
  );
};
