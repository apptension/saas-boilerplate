import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { chartColors } from '@sb/webapp-core/components/ui/chart';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Crown,
  FileCode2,
  FolderTree,
  Key,
  Layers,
  Lock,
  Route,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="overflow-x-auto rounded-lg border border-border/50 bg-muted/50 p-4 font-mono text-sm">
    <code>{children}</code>
  </pre>
);

type FeatureCardProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
};

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Card className="transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
    <CardHeader className="space-y-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-foreground">
        {icon}
      </div>
      <div className="space-y-2">
        <CardTitle>
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </div>
    </CardHeader>
  </Card>
);

const FeatureItem = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="flex gap-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
      <Icon className="h-5 w-5" />
    </div>
    <div className="space-y-1">
      <p className="font-medium leading-none">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export const Admin = () => {
  const intl = useIntl();

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Admin Panel',
          id: 'Admin / page title',
        })}
      />

      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Hero Section with brand gradient */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 p-8 md:p-12">
          {/* Brand gradient background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              background: `linear-gradient(135deg, ${chartColors.brandYellow} 0%, ${chartColors.brandGreen} 100%)`,
            }}
          />
          {/* Decorative blobs with brand colors */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
            style={{ backgroundColor: chartColors.brandGreen, opacity: 0.1 }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl"
            style={{ backgroundColor: chartColors.brandYellow, opacity: 0.1 }}
          />

          <div className="relative space-y-6">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl text-black"
                style={{
                  background: `linear-gradient(135deg, ${chartColors.brandYellow} 0%, ${chartColors.brandGreen} 100%)`,
                }}
              >
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">
                  <Lock className="mr-1 h-3 w-3" />
                  <FormattedMessage defaultMessage="Admin Only" id="Admin / Badge" />
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  <FormattedMessage defaultMessage="Role-Based Access Control" id="Admin / Hero Title" />
                </h1>
              </div>
            </div>

            <Paragraph className="max-w-2xl text-lg text-muted-foreground">
              <FormattedMessage
                defaultMessage="This page demonstrates the built-in role-based access control system. Only users with the ADMIN role can access this page. Regular users are automatically redirected."
                id="Admin / Hero Description"
              />
            </Paragraph>

            <div className="flex flex-wrap items-center gap-4">
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-black"
                style={{ backgroundColor: chartColors.brandGreen }}
              >
                <CheckCircle2 className="h-4 w-4" />
                <FormattedMessage defaultMessage="Access Verified" id="Admin / Access Verified" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Crown className="h-4 w-4 text-amber-500" />
                <FormattedMessage defaultMessage="You have admin privileges" id="Admin / Admin Privileges" />
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold tracking-tight">
              <FormattedMessage defaultMessage="Built-in Security Features" id="Admin / Features Title" />
            </h2>
      </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title={<FormattedMessage defaultMessage="Two-Tier Role System" id="Admin / Feature 1 Title" />}
              description={
                <FormattedMessage
                  defaultMessage="Application-level roles (USER/ADMIN) for global access control across the entire platform."
                  id="Admin / Feature 1 Description"
                />
              }
            />

            <FeatureCard
              icon={<Layers className="h-5 w-5" />}
              title={<FormattedMessage defaultMessage="Tenant-Level Roles" id="Admin / Feature 2 Title" />}
              description={
                <FormattedMessage
                  defaultMessage="Multi-tenant roles (OWNER/ADMIN/MEMBER) for granular access within each organization."
                  id="Admin / Feature 2 Description"
                />
              }
            />

            <FeatureCard
              icon={<Route className="h-5 w-5" />}
              title={<FormattedMessage defaultMessage="Protected Routes" id="Admin / Feature 3 Title" />}
              description={
                <FormattedMessage
                  defaultMessage="Declarative route protection with automatic redirects and role-based component rendering."
                  id="Admin / Feature 3 Description"
                />
              }
            />
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Route Protection */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Code2 className="h-4 w-4" />
                </div>
                <FormattedMessage defaultMessage="Protecting Routes" id="Admin / Route Protection Title" />
              </CardTitle>
              <CardDescription>
                <FormattedMessage
                  defaultMessage="Wrap your routes with AuthRoute to restrict access based on user roles"
                  id="Admin / Route Protection Description"
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <CodeBlock>
{`// Application-level (USER/ADMIN)
<Route element={<AuthRoute allowedRoles={Role.ADMIN} />}>
  <Route path="/admin" element={<Admin />} />
</Route>

// Tenant-level (OWNER/ADMIN/MEMBER)
<Route element={<TenantAuthRoute 
  allowedRoles={[
    TenantUserRole.ADMIN, 
    TenantUserRole.OWNER
  ]} 
/>}>
  <Route path="settings" element={<Settings />} />
</Route>`}
              </CodeBlock>

              <div className="space-y-3 pt-2">
                <FeatureItem
                  icon={Lock}
                  title={intl.formatMessage({ defaultMessage: 'Automatic Redirects', id: 'Admin / Feature Redirect Title' })}
                  description={intl.formatMessage({
                    defaultMessage: 'Unauthorized users are redirected to login or 404 page',
                    id: 'Admin / Feature Redirect Description',
                  })}
                />
                <FeatureItem
                  icon={Key}
                  title={intl.formatMessage({ defaultMessage: 'Multiple Role Support', id: 'Admin / Feature Multi Role Title' })}
                  description={intl.formatMessage({
                    defaultMessage: 'Allow multiple roles with array syntax',
                    id: 'Admin / Feature Multi Role Description',
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Conditional Rendering */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                  <FileCode2 className="h-4 w-4" />
                </div>
                <FormattedMessage defaultMessage="Conditional Rendering" id="Admin / Conditional Title" />
              </CardTitle>
              <CardDescription>
                <FormattedMessage
                  defaultMessage="Show or hide UI elements based on user permissions"
                  id="Admin / Conditional Description"
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <CodeBlock>
{`// Application-level: using the hook
const { isAllowed } = useRoleAccessCheck(Role.ADMIN);
{isAllowed && <AdminButton />}

// Application-level: using the component
<RoleAccess allowedRoles={Role.ADMIN}>
  <AdminButton />
</RoleAccess>

// Tenant-level: using the hook
const { isAllowed } = useTenantRoleAccessCheck(
  [TenantUserRole.OWNER]
);
{isAllowed && <DeleteOrgButton />}

// Tenant-level: using the component
<TenantRoleAccess 
  allowedRoles={[TenantUserRole.OWNER]}
>
  <DeleteOrgButton />
</TenantRoleAccess>`}
              </CodeBlock>

              <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      <FormattedMessage defaultMessage="Pro Tip" id="Admin / Pro Tip Title" />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <FormattedMessage
                        defaultMessage="Always verify permissions on the backend too. Frontend checks are for UX, not security."
                        id="Admin / Pro Tip Description"
                      />
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Extending Roles */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                <Settings className="h-4 w-4" />
              </div>
              <FormattedMessage defaultMessage="Extending Roles" id="Admin / Extending Title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="How to add custom roles to the system"
                id="Admin / Extending Description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">
                <FormattedMessage defaultMessage="Application-Level Roles" id="Admin / Extending App Roles Title" />
              </h4>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  defaultMessage="To add a new application-level role (like MODERATOR), update these files:"
                  id="Admin / Extending App Roles Description"
                />
              </p>
              <div className="space-y-3">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    1. Backend - packages/backend/common/acl/helpers.py
                  </p>
                  <CodeBlock>
{`class CommonGroups:
    Admin = 'admin'
    User = 'user'
    Moderator = 'moderator'  # Add new role`}
                  </CodeBlock>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    2. Frontend - packages/webapp/src/modules/auth/auth.types.ts
                  </p>
                  <CodeBlock>
{`export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',  // Add new role
}`}
                  </CodeBlock>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">
                <FormattedMessage defaultMessage="Tenant-Level Roles" id="Admin / Extending Tenant Roles Title" />
              </h4>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  defaultMessage="To add a new tenant role (like VIEWER), update these files:"
                  id="Admin / Extending Tenant Roles Description"
                />
              </p>
              <div className="space-y-3">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    1. Backend - packages/backend/apps/multitenancy/constants.py
                  </p>
                  <CodeBlock>
{`class TenantUserRole(models.TextChoices):
    OWNER = "OWNER", "Owner"
    ADMIN = "ADMIN", "Administrator"
    MEMBER = "MEMBER", "Member"
    VIEWER = "VIEWER", "Viewer"  # Add new role`}
                  </CodeBlock>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    2. GraphQL Schema - packages/webapp-libs/webapp-api-client/graphql/schema/api.graphql
                  </p>
                  <CodeBlock>
{`enum TenantUserRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER  # Add new role
}`}
                  </CodeBlock>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    3. Run codegen to update TypeScript types
                  </p>
                  <CodeBlock>
{`pnpm nx run webapp-api-client:graphql:generate-types`}
                  </CodeBlock>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Structure */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                <FolderTree className="h-4 w-4" />
              </div>
              <FormattedMessage defaultMessage="Key Files & Locations" id="Admin / Files Title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Important files for understanding and extending the role-based access control system"
                id="Admin / Files Description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-foreground/60" />
                  <FormattedMessage defaultMessage="Application-Level Auth" id="Admin / Files App Level" />
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <p className="text-foreground">packages/webapp/src/modules/auth/auth.types.ts</p>
                  <p className="text-muted-foreground">packages/webapp/src/shared/components/routes/authRoute/</p>
                  <p className="text-muted-foreground">packages/webapp/src/shared/components/roleAccess/</p>
                  <p className="text-muted-foreground">packages/webapp/src/shared/hooks/useRoleAccessCheck/</p>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-foreground/60" />
                  <FormattedMessage defaultMessage="Tenant-Level Auth" id="Admin / Files Tenant Level" />
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <p className="text-foreground">packages/webapp-libs/webapp-tenants/src/hooks/useTenantRoleAccessCheck/</p>
                  <p className="text-muted-foreground">packages/webapp-libs/webapp-tenants/src/components/routes/tenantAuthRoute/</p>
                  <p className="text-muted-foreground">packages/webapp-libs/webapp-tenants/src/components/tenantRoleAccess/</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://docs.demo.saas.apptoku.com/api-reference/backend/users"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:no-underline [&]:no-underline"
              >
                <BookOpen className="h-4 w-4" />
                <FormattedMessage defaultMessage="Backend Users Docs" id="Admin / Link Backend Docs" />
                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
              </a>
              <a
                href="https://docs.demo.saas.apptoku.com/api-reference/webapp/multitenancy"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:no-underline [&]:no-underline"
              >
                <BookOpen className="h-4 w-4" />
                <FormattedMessage defaultMessage="Multi-Tenancy Docs" id="Admin / Link Tenancy Docs" />
                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* How This Page Works */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <FormattedMessage defaultMessage="How This Page Works" id="Admin / How It Works Title" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">
              <FormattedMessage
                defaultMessage="This admin page is protected by the AuthRoute component configured with Role.ADMIN. The route definition in app.component.tsx looks like this:"
                id="Admin / How It Works Description"
              />
            </p>
            <CodeBlock>
              {`<Route element={<AuthRoute allowedRoles={Role.ADMIN} />}>
  <Route path={RoutesConfig.admin} element={<Admin />} />
</Route>`}
            </CodeBlock>
            <p className="text-sm text-muted-foreground">
              <FormattedMessage
                defaultMessage="When a non-admin user tries to access /admin, they are automatically redirected to the login page (if not logged in) or the 404 page (if logged in but not an admin)."
                id="Admin / How It Works Redirect"
              />
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
