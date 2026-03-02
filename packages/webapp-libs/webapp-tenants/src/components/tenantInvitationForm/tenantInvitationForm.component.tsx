import { useQuery } from '@apollo/client/react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { cn } from '@sb/webapp-core/lib/utils';
import { Check, ChevronDown, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useCurrentTenant } from '../../providers';
import { allOrganizationRolesQuery } from '../../routes/tenantSettings/tenantRoles/tenantRoles.graphql';
import { UseTenantInvitationFormHookProps, useTenantInvitationForm } from './tenantInvitationForm.hook';

export type TenantInvitationFormFields = {
  email: string;
  organizationRoleIds: string[];
};

export type TenantInvitationFormProps = UseTenantInvitationFormHookProps & {
  loading: boolean;
};

interface OrganizationRole {
  id: string;
  name: string;
  description?: string;
  color?: string | null;
  isSystemRole?: boolean | null;
  isOwnerRole?: boolean | null;
}

// Role color badge component
const RoleColorBadge = ({ color }: { color: string }) => {
  const colorClasses: Record<string, string> = {
    BLUE: 'bg-blue-500',
    GREEN: 'bg-green-500',
    RED: 'bg-red-500',
    PURPLE: 'bg-purple-500',
    YELLOW: 'bg-yellow-500',
    ORANGE: 'bg-orange-500',
    PINK: 'bg-pink-500',
    TEAL: 'bg-teal-500',
    GRAY: 'bg-gray-500',
  };
  return <div className={cn('h-3 w-3 rounded-full', colorClasses[color] || 'bg-blue-500')} />;
};

export const TenantInvitationForm = ({ initialData, onSubmit, error, loading }: TenantInvitationFormProps) => {
  const intl = useIntl();
  const { data: currentTenant } = useCurrentTenant();
  const tenantId = currentTenant?.id ?? '';
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch organization roles for this tenant
  const { data: rolesData, loading: rolesLoading } = useQuery(allOrganizationRolesQuery, {
    variables: { tenantId },
    skip: !tenantId,
  });

  const availableRoles: OrganizationRole[] = (rolesData?.allOrganizationRoles?.edges || [])
    .map((edge) => edge?.node)
    .filter((role): role is NonNullable<typeof role> => role != null)
    .map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description ?? undefined,
      color: role.color ?? undefined,
      isSystemRole: role.isSystemRole ?? undefined,
      isOwnerRole: role.isOwnerRole ?? undefined,
    }));

  const {
    form: {
      register,
      formState: { errors },
      watch,
      setValue,
    },
    form,
    genericError,
    hasGenericErrorOnly,
    handleFormSubmit,
  } = useTenantInvitationForm({ initialData, onSubmit, error });

  const watchedRoleIds = watch('organizationRoleIds');
  const selectedRoleIds = useMemo(() => watchedRoleIds || [], [watchedRoleIds]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRolesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRole = useCallback(
    (roleId: string) => {
      const currentIds = selectedRoleIds || [];
      const newSelected = currentIds.includes(roleId)
        ? currentIds.filter((id: string) => id !== roleId)
        : [...currentIds, roleId];
      setValue('organizationRoleIds', newSelected, { shouldValidate: true });
    },
    [selectedRoleIds, setValue]
  );

  const getSelectedRolesDisplay = useCallback(() => {
    if (!selectedRoleIds || selectedRoleIds.length === 0) {
      return intl.formatMessage({
        defaultMessage: 'Select roles',
        id: 'Tenant invitation form / Roles placeholder',
      });
    }
    const selectedRoles = availableRoles.filter((r) => selectedRoleIds.includes(r.id));
    return selectedRoles.map((r) => r.name).join(', ');
  }, [selectedRoleIds, availableRoles, intl]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                <FormattedMessage defaultMessage="Invite new member" id="Tenant invitation form / Invite new member" />
              </CardTitle>
              <CardDescription className="mt-0.5">
                <FormattedMessage
                  defaultMessage="Send an invitation to join your organization"
                  id="Tenant invitation form / Description"
                />
              </CardDescription>
            </div>
          </div>
        </div>
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
                name="organizationRoleIds"
                render={({ fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      <p
                        className={cn(`mb-1.5 text-sm font-medium`, {
                          'text-destructive': !!fieldState.error,
                          'text-foreground': !fieldState.error,
                        })}
                      >
                        <FormattedMessage defaultMessage="Roles:" id="Tenant invitation form / Roles label" />
                      </p>
                    </FormLabel>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
                        disabled={rolesLoading}
                        className={cn(
                          'flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm',
                          'bg-transparent ring-offset-background',
                          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                          {
                            'border-destructive': !!fieldState.error,
                            'border-input': !fieldState.error,
                          }
                        )}
                      >
                        <span
                          className={cn('truncate', {
                            'text-muted-foreground': !selectedRoleIds || selectedRoleIds.length === 0,
                          })}
                        >
                          {rolesLoading ? 'Loading...' : getSelectedRolesDisplay()}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>

                      {rolesDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-2 shadow-md">
                          {availableRoles.length === 0 ? (
                            <p className="py-2 text-center text-sm text-muted-foreground">
                              <FormattedMessage
                                defaultMessage="No roles available"
                                id="Tenant invitation form / No roles"
                              />
                            </p>
                          ) : (
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {availableRoles.map((role) => {
                                const isSelected = selectedRoleIds?.includes(role.id);
                                return (
                                  <button
                                    key={role.id}
                                    type="button"
                                    className={cn(
                                      'flex w-full items-center gap-3 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent text-left',
                                      isSelected && 'bg-accent/50'
                                    )}
                                    onClick={() => toggleRole(role.id)}
                                    aria-pressed={isSelected}
                                  >
                                    <div
                                      className={cn(
                                        'flex h-4 w-4 items-center justify-center rounded border',
                                        isSelected
                                          ? 'border-primary bg-primary text-primary-foreground'
                                          : 'border-input'
                                      )}
                                    >
                                      {isSelected && <Check className="h-3 w-3" />}
                                    </div>
                                    <RoleColorBadge color={role.color || 'BLUE'} />
                                    <span className="text-sm">{role.name}</span>
                                    {role.isSystemRole && (
                                      <span className="text-xs text-muted-foreground">(System)</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
                rules={{
                  validate: (value) => {
                    if (!value || value.length === 0) {
                      return intl.formatMessage({
                        defaultMessage: 'At least one role is required',
                        id: 'Tenant invitation form / Role required',
                      });
                    }
                    return true;
                  },
                }}
              />
            </div>

            <div>
              <Button type="submit" disabled={loading || rolesLoading} className="w-full sm:w-fit">
                <FormattedMessage defaultMessage="Invite" id="Tenant invitation form / Submit button" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
