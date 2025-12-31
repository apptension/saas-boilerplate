import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import {
  PasswordRequirements,
  PasswordStrengthIndicator,
  validatePassword,
} from '@sb/webapp-core/components/passwordStrength';
import { Small } from '@sb/webapp-core/components/typography';
import { FormattedMessage, useIntl } from 'react-intl';

import { useChangePasswordForm } from './changePasswordForm.hooks';

export const ChangePasswordForm = () => {
  const intl = useIntl();

  const {
    form: {
      formState: { errors },
      register,
      getValues,
      watch,
    },
    genericError,
    hasGenericErrorOnly,
    loading,
    handleChangePassword,
  } = useChangePasswordForm();

  const newPassword = watch('newPassword') || '';

  return (
    <div className="w-full">
      <form noValidate onSubmit={handleChangePassword} className="flex w-full flex-col gap-6">
        <div className="w-full">
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
        </div>

        <div className="flex w-full flex-col gap-6">
          <div className="w-full">
            <Input
              {...register('newPassword', {
                required: {
                  value: true,
                  message: intl.formatMessage({
                    defaultMessage: 'New password is required',
                    id: 'Auth / Change password / Password required',
                  }),
                },
                validate: {
                  minLength: (value) =>
                    value.length >= 8 ||
                    intl.formatMessage({
                      defaultMessage: 'Password must be at least 8 characters long',
                      id: 'Auth / Change password / Password too short',
                    }),
                  notCommon: (value) => {
                    const validation = validatePassword(value);
                    return (
                      validation.notCommon ||
                      intl.formatMessage({
                        defaultMessage: 'This password is too common. Please choose a more unique password.',
                        id: 'Auth / Change password / Password too common frontend',
                      })
                    );
                  },
                  notNumericOnly: (value) => {
                    const validation = validatePassword(value);
                    return (
                      validation.notNumericOnly ||
                      intl.formatMessage({
                        defaultMessage: "Password can't be entirely numeric.",
                        id: 'Auth / Change password / Password numeric only',
                      })
                    );
                  },
                },
              })}
              type="password"
              label={intl.formatMessage({
                defaultMessage: 'New password',
                id: 'Auth / Change password / New password label',
              })}
              placeholder={intl.formatMessage({
                defaultMessage: 'Create a strong password',
                id: 'Auth / Change password / New password placeholder',
              })}
              error={errors.newPassword?.message}
            />
            <PasswordStrengthIndicator password={newPassword} className="mt-2" />
            <PasswordRequirements password={newPassword} className="mt-3" />
          </div>

          <div className="w-full">
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
                defaultMessage: 'Re-enter your new password',
                id: 'Auth / Change password / Confirm new password placeholder',
              })}
              error={errors.confirmNewPassword?.message}
            />
          </div>
        </div>

        {hasGenericErrorOnly && (
          <div className="text-sm text-destructive">
            <Small>{genericError}</Small>
          </div>
        )}

        <div>
          <Button disabled={loading} type="submit" className="w-full sm:w-fit">
            <FormattedMessage defaultMessage="Change password" id="Auth / Change password / Submit button" />
          </Button>
        </div>
      </form>
    </div>
  );
};
