import { TenantUserRole } from '@sb/webapp-api-client';
import { Button } from '@sb/webapp-core/components/buttons';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@sb/webapp-core/components/forms';
import { Card, CardContent, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sb/webapp-core/components/ui/select';
import { cn } from '@sb/webapp-core/lib/utils';
import { FormattedMessage, useIntl } from 'react-intl';

import { useTenantRoles } from '../../hooks';
import { UseTenantInvitationFormHookProps, useTenantInvitationForm } from './tenantInvitationForm.hook';

export type TenantInvitationFormFields = {
  email: string;
  role: TenantUserRole;
};

export type TenantInvitationFormProps = UseTenantInvitationFormHookProps & {
  loading: boolean;
};

export const TenantInvitationForm = ({ initialData, onSubmit, error, loading }: TenantInvitationFormProps) => {
  const intl = useIntl();
  const { getRoleTranslation } = useTenantRoles();

  const rolePlaceholder = intl.formatMessage({
    defaultMessage: 'Select role',
    id: 'Tenant invitation form / Role placeholder',
  });

  const {
    form: {
      register,
      formState: { errors },
    },
    form,
    genericError,
    hasGenericErrorOnly,
    handleFormSubmit,
  } = useTenantInvitationForm({ initialData, onSubmit, error });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage defaultMessage="Invite new member" id="Tenant invitation form / Invite new member" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="flex flex-col gap-6" onSubmit={handleFormSubmit}>
            {hasGenericErrorOnly && (
              <div className="text-sm text-destructive">
                <span>{genericError}</span>
              </div>
            )}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        {...register('email', {
                          required: {
                            value: true,
                            message: intl.formatMessage({
                              defaultMessage: 'Email is required',
                              id: 'Tenant invitation form / Email required',
                            }),
                          },
                        })}
                        label={intl.formatMessage({
                          defaultMessage: 'Email:',
                          id: 'Tenant invitation form / Email label',
                        })}
                        placeholder={intl.formatMessage({
                          defaultMessage: 'Email',
                          id: 'Tenant invitation form / Email placeholder',
                        })}
                        error={errors.email?.message}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      <p
                        className={cn(`mb-1.5 text-sm font-medium`, {
                          'text-destructive': !!fieldState.error,
                          'text-foreground': !fieldState.error,
                        })}
                      >
                        <FormattedMessage defaultMessage="Role:" id="Tenant invitation form / Role label" />
                      </p>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={cn({
                            'border-destructive': !!fieldState.error,
                          })}>
                            <SelectValue placeholder={rolePlaceholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[TenantUserRole.MEMBER, TenantUserRole.ADMIN, TenantUserRole.OWNER].map((role) => (
                            <SelectItem value={role} key={role}>
                              {getRoleTranslation(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
                rules={{
                  required: {
                    value: true,
                    message: intl.formatMessage({
                      defaultMessage: 'Role is required',
                      id: 'Tenant invitation form / Role required',
                    }),
                  },
                }}
              />
            </div>

            <div>
              <Button type="submit" disabled={loading} className="w-full sm:w-fit">
                <FormattedMessage defaultMessage="Invite" id="Tenant invitation form / Submit button" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
