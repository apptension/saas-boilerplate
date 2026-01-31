import { useQuery } from '@apollo/client/react';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@sb/webapp-core/components/ui/collapsible';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { cn } from '@sb/webapp-core/lib/utils';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { currentUserOrganizationRolesQuery } from '@sb/webapp-tenants/routes/tenantSettings/tenantRoles/tenantRoles.graphql';
import {
  ChevronDown,
  Crown,
  Fingerprint,
  Lock,
  Mail,
  Monitor,
  Shield,
  ShieldCheck,
  User,
  UserCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

import { ActiveSessions } from '../../shared/components/auth/activeSessions';
import { AvatarForm } from '../../shared/components/auth/avatarForm';
import { ChangePasswordForm } from '../../shared/components/auth/changePasswordForm';
import { EditProfileForm } from '../../shared/components/auth/editProfileForm';
import { PasskeysForm } from '../../shared/components/auth/passkeysForm';
import { TwoFactorAuthForm } from '../../shared/components/auth/twoFactorAuthForm';
import { useAuth } from '../../shared/hooks';

// Role color mapping
const ROLE_COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  BLUE: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  GREEN: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  RED: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  YELLOW: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  PURPLE: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  ORANGE: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  PINK: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
  TEAL: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  GRAY: { bg: 'bg-slate-100 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-800' },
};

// Permission category labels
const CATEGORY_LABELS: Record<string, string> = {
  ORGANIZATION: 'Organization',
  MEMBERS: 'Members',
  SECURITY: 'Security',
  BILLING: 'Billing',
  FEATURES: 'Features',
  DASHBOARD: 'Dashboard',
  MANAGEMENT: 'Management',
};

export const Profile = () => {
  const intl = useIntl();
  const { currentUser } = useAuth();
  const { data: currentTenant } = useCurrentTenant();
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  // Fetch organization roles for the current tenant
  const { data: rolesData } = useQuery(currentUserOrganizationRolesQuery, {
    variables: { tenantId: currentTenant?.id ?? '' },
    skip: !currentTenant?.id,
  });

  const organizationRoles = rolesData?.currentUserOrganizationRoles || [];
  const userPermissions = rolesData?.currentUserPermissions || [];

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped: Record<string, string[]> = {};

    // Get unique permissions from all roles
    const allPermissions = new Set<string>();
    organizationRoles.forEach((role) => {
      if (role?.isOwnerRole) {
        // Owner has all permissions - show special indicator
        return;
      }
      role?.permissions?.forEach((p) => {
        if (p?.name) allPermissions.add(`${p.category}:${p.name}`);
      });
    });

    // If we have actual permission codes, use those instead
    if (userPermissions.length > 0) {
      userPermissions.forEach((code) => {
        const [category] = code?.split('.') || [];
        if (category) {
          const normalizedCategory = category.toUpperCase();
          if (!grouped[normalizedCategory]) {
            grouped[normalizedCategory] = [];
          }
          // Convert code to readable name
          const readableName = code?.split('.').slice(1).join(' ').replace(/\./g, ' ');
          if (readableName) {
            grouped[normalizedCategory].push(readableName);
          }
        }
      });
    }

    return grouped;
  }, [organizationRoles, userPermissions]);

  const isOwner = organizationRoles.some((r) => r?.isOwnerRole);

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Profile Settings',
          id: 'Profile / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="User profile" id="Auth / Profile details / Header" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="Here you can find more information about your account and edit it"
              id="Auth / Profile details / Label"
            />
          </Paragraph>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              <FormattedMessage defaultMessage="Profile Overview" id="Profile / Overview / Title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage defaultMessage="Your account information" id="Profile / Overview / Description" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex-shrink-0">
                <AvatarForm />
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <FormattedMessage defaultMessage="Name" id="Profile / Name / Label" />
                  </div>
                  <Paragraph className="text-base">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </Paragraph>
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <FormattedMessage defaultMessage="Email" id="Profile / Email / Label" />
                  </div>
                  <Paragraph className="text-base">{currentUser?.email}</Paragraph>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    <FormattedMessage defaultMessage="Organization Roles" id="Profile / Organization Roles / Label" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {organizationRoles.length > 0 ? (
                      organizationRoles.map((role) => {
                        const colorClass = ROLE_COLOR_CLASSES[role?.color?.toUpperCase() || 'BLUE'] || ROLE_COLOR_CLASSES.BLUE;
                        return (
                          <Badge
                            key={role?.id}
                            variant="outline"
                            className={cn(
                              'text-xs font-medium px-2.5 py-1 border',
                              colorClass.bg,
                              colorClass.text,
                              colorClass.border
                            )}
                          >
                            {role?.isOwnerRole && <Crown className="h-3 w-3 mr-1.5" />}
                            {role?.name}
                          </Badge>
                        );
                      })
                    ) : (
                      currentUser?.roles?.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))
                    )}
                  </div>

                  {/* Expandable permissions section */}
                  {organizationRoles.length > 0 && (
                    <Collapsible open={permissionsOpen} onOpenChange={setPermissionsOpen}>
                      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer group">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="font-medium">
                          {isOwner ? (
                            <FormattedMessage defaultMessage="Full access to all features" id="Profile / Full access" />
                          ) : (
                            <FormattedMessage
                              defaultMessage="View your {count} permissions"
                              id="Profile / View permissions"
                              values={{ count: userPermissions.length }}
                            />
                          )}
                        </span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            permissionsOpen && 'rotate-180'
                          )}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        {isOwner ? (
                          <div className="rounded-lg border bg-violet-50 dark:bg-violet-900/20 p-4">
                            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                              <Crown className="h-5 w-5" />
                              <p className="text-sm font-medium">
                                <FormattedMessage
                                  defaultMessage="As an Owner, you have unrestricted access to all organization features and settings."
                                  id="Profile / Owner full access message"
                                />
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                              <div key={category}>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  {CATEGORY_LABELS[category] || category}
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {permissions.map((permission, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-[10px] font-normal capitalize"
                                    >
                                      {permission}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {Object.keys(permissionsByCategory).length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                <FormattedMessage
                                  defaultMessage="No specific permissions assigned."
                                  id="Profile / No permissions"
                                />
                              </p>
                            )}
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Data Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <FormattedMessage defaultMessage="Personal data" id="Auth / Profile details / Personal data header" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Update your account details"
                id="Auth / Profile details / Personal data label"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditProfileForm />
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <FormattedMessage defaultMessage="Change password" id="Auth / Profile details / Change password header" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Update your password"
                id="Auth / Profile details / Change password label"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        {/* Two-Factor Authentication Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <FormattedMessage
                defaultMessage="Two-factor Authentication"
                id="Auth / Profile details / Two-factor Authentication header"
              />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Enable 2FA on your account"
                id="Auth / Profile details / Two-factor Authentication label"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TwoFactorAuthForm isEnabled={currentUser?.otpEnabled} />
          </CardContent>
        </Card>

        {/* Passkeys Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              <FormattedMessage defaultMessage="Passkeys" id="Auth / Profile details / Passkeys header" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Sign in with your fingerprint, face, or device PIN"
                id="Auth / Profile details / Passkeys label"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasskeysForm />
          </CardContent>
        </Card>

        {/* Active Sessions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <FormattedMessage defaultMessage="Active Sessions" id="Auth / Profile details / Sessions header" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="View and manage your active sign-in sessions across devices"
                id="Auth / Profile details / Sessions label"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActiveSessions />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
