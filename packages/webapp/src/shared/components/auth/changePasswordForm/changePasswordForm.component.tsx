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
        className={cn('flex max-w-xs flex-row flex-wrap items-end justify-center gap-4 md:max-w-full md:justify-start')}
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

        <div
          className={cn(
            { 'gap-8': !!errors.newPassword, 'gap-4': !errors.newPassword },
            'flex w-full flex-row flex-wrap'
          )}
        >
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

        {hasGenericErrorOnly ? <Small className="text-red-500">{genericError}</Small> : null}

        <Button disabled={loading} type="submit" className={cn({ 'mt-4': !!errors.newPassword }, 'w-full md:w-fit')}>
          <FormattedMessage defaultMessage="Change password" id="Auth / Change password / Submit button" />
        </Button>
      </form>
    </div>
  );
};
