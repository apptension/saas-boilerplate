import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Small } from '@sb/webapp-core/components/typography';
import { cn } from '@sb/webapp-core/lib/utils';
import { FormattedMessage, useIntl } from 'react-intl';

import { useChangePasswordForm } from './changePasswordForm.hooks';

export const ChangePasswordForm = () => {
  const intl = useIntl();

  const {
    form: {
      formState: { errors },
      register,
      getValues,
    },
    genericError,
    hasGenericErrorOnly,
    loading,
    handleChangePassword,
  } = useChangePasswordForm();

  return (
    <div className="w-full">
      <form
        noValidate
        onSubmit={handleChangePassword}
        className="flex w-full flex-col gap-6"
      >
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

        <div className="flex w-full flex-col gap-6 sm:flex-row">
          <div className="flex-1">
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
          </div>

          <div className="flex-1">
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
