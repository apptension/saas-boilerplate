import { Button } from '@sb/webapp-core/components/buttons';
import { Form, FormControl, FormField, FormItem, FormLabel, Input } from '@sb/webapp-core/components/forms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sb/webapp-core/components/ui/select';
import { Small } from '@sb/webapp-core/components/typography';
import { useAvailableLocales } from '@sb/webapp-core/hooks/useAvailableLocales';
import { FormattedMessage, useIntl } from 'react-intl';

import { FIRST_NAME_MAX_LENGTH, LAST_NAME_MAX_LENGTH } from './editProfileForm.constants';
import { useEditProfileForm } from './editProfileForm.hooks';

export const EditProfileForm = () => {
  const intl = useIntl();
  const { locales, getFlag } = useAvailableLocales();

  const {
    form: {
      formState: { errors },
      register,
    },
    form,
    genericError,
    hasGenericErrorOnly,
    loading,
    handleUpdate,
  } = useEditProfileForm();

  const languagePlaceholder = intl.formatMessage({
    defaultMessage: 'Select language',
    id: 'Auth / Update profile / Language placeholder',
  });

  return (
    <div className="w-full">
      <Form {...form}>
        <form noValidate onSubmit={handleUpdate} className="flex w-full flex-col gap-6">
          <div className="flex w-full flex-col gap-6 sm:flex-row">
            <div className="flex-1">
              <Input
                {...register('firstName', {
                  maxLength: {
                    value: FIRST_NAME_MAX_LENGTH,
                    message: intl.formatMessage({
                      defaultMessage: 'First name is too long',
                      id: 'Auth / Update profile/ First name max length error',
                    }),
                  },
                })}
                label={intl.formatMessage({
                  defaultMessage: 'First name',
                  id: 'Auth / Update profile / First name label',
                })}
                error={errors.firstName?.message}
              />
            </div>

            <div className="flex-1">
              <Input
                {...register('lastName', {
                  maxLength: {
                    value: LAST_NAME_MAX_LENGTH,
                    message: intl.formatMessage({
                      defaultMessage: 'Last name is too long',
                      id: 'Auth / Update profile/ Last name max length error',
                    }),
                  },
                })}
                label={intl.formatMessage({
                  defaultMessage: 'Last name',
                  id: 'Auth / Update profile / Last name label',
                })}
                error={errors.lastName?.message}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 sm:pr-3">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage defaultMessage="Preferred language" id="Auth / Update profile / Language label" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={languagePlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locales.map((locale) => (
                        <SelectItem value={locale.code} key={locale.code}>
                          {getFlag(locale.code)} {locale.native_name || locale.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      defaultMessage="Used for email notifications and communications"
                      id="Auth / Update profile / Language description"
                    />
                  </p>
                </FormItem>
              )}
            />
          </div>

          {hasGenericErrorOnly && (
            <div className="text-sm text-destructive">
              <Small>{genericError}</Small>
            </div>
          )}

          <div>
            <Button type="submit" disabled={loading} className="w-full sm:w-fit">
              <FormattedMessage defaultMessage="Update personal data" id="Auth / Update profile/ Submit button" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
