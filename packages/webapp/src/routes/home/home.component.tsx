import { useQuery } from '@apollo/client';
import { TenantUserRole } from '@sb/webapp-api-client';
import { Link } from '@sb/webapp-core/components/buttons';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Alert, AlertDescription, AlertTitle } from '@sb/webapp-core/components/ui/alert';
import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ChartContainer,
  ChartEmptyState,
  ChartGradients,
  ChartLegendItem,
  ChartTooltip,
  Pie,
  PieChart,
  ResponsiveContainer,
  StatCard,
  XAxis,
  YAxis,
  axisDefaults,
  chartColors,
  gridDefaults,
} from '@sb/webapp-core/components/ui/chart';
import { Skeleton } from '@sb/webapp-core/components/ui/skeleton';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { TenantRoleAccess } from '@sb/webapp-tenants/components/tenantRoleAccess';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  BookOpen,
  Code2,
  Database,
  ExternalLink,
  FileText,
  Github,
  LayoutDashboard,
  Rocket,
  Server,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../app/config/routes';
import { dashboardStatsQuery } from './home.graphql';

type DashboardItem = {
  title: string;
  subtitle: string;
  link: string;
  roleAccess?: TenantUserRole[];
};

export const Home = () => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const generateTenantPath = useGenerateTenantPath();
  const { data: currentTenant } = useCurrentTenant();

  const { data: statsData, loading: statsLoading } = useQuery(dashboardStatsQuery, {
    variables: { tenantId: currentTenant?.id ?? '' },
    skip: !currentTenant,
    fetchPolicy: 'cache-and-network',
  });


  // Process statistics from real data
  const stats = useMemo(() => {
    const crudItems = statsData?.allCrudDemoItems?.edges?.length ?? 0;
    const documents = statsData?.allDocumentDemoItems?.edges?.length ?? 0;
    const notifications = statsData?.allNotifications?.edges?.length ?? 0;
    const unreadNotifications =
      statsData?.allNotifications?.edges?.filter((e) => !e?.node?.readAt)?.length ?? 0;
    const members = statsData?.tenant?.userMemberships?.filter((m) => m?.invitationAccepted)?.length ?? 0;
    const pendingInvites = statsData?.tenant?.userMemberships?.filter((m) => !m?.invitationAccepted)?.length ?? 0;

    return { crudItems, documents, notifications, unreadNotifications, members, pendingInvites };
  }, [statsData]);

  // Generate activity data from notifications (group by day)
  const activityData = useMemo(() => {
    const notifications = statsData?.allNotifications?.edges ?? [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        count: 0,
      };
    });

    notifications.forEach((edge) => {
      if (!edge?.node?.createdAt) return;
      const notifDate = new Date(edge.node.createdAt).toISOString().split('T')[0];
      const dayData = last7Days.find((d) => d.date === notifDate);
      if (dayData) dayData.count += 1;
    });

    return last7Days;
  }, [statsData]);

  // Member role distribution
  const roleDistribution = useMemo(() => {
    const memberships = statsData?.tenant?.userMemberships ?? [];
    const owners = memberships.filter((m) => m?.role === TenantUserRole.OWNER).length;
    const admins = memberships.filter((m) => m?.role === TenantUserRole.ADMIN).length;
    const members = memberships.filter((m) => m?.role === TenantUserRole.MEMBER).length;

    return [
      { name: 'Owners', value: owners, color: chartColors.brandGreen },
      { name: 'Admins', value: admins, color: chartColors.brandYellowGreen },
      { name: 'Members', value: members, color: chartColors.brandYellow },
    ].filter((r) => r.value > 0);
  }, [statsData]);

  // Data types distribution for bar chart
  const dataDistribution = useMemo(() => {
    return [
      { name: 'CRUD Items', value: stats.crudItems, fill: chartColors.brandGreen },
      { name: 'Documents', value: stats.documents, fill: chartColors.brandLimeGreen },
      { name: 'Notifications', value: stats.notifications, fill: chartColors.brandYellow },
    ];
  }, [stats]);

  const dashboardItems: DashboardItem[] = [
    {
      title: intl.formatMessage({ defaultMessage: 'Payments', id: 'Home / Payments / Title' }),
      subtitle: intl.formatMessage({
        defaultMessage: 'Example of single payment form.',
        id: 'Home / Payments / Subtitle',
      }),
      link: generateTenantPath(RoutesConfig.finances.paymentConfirm),
      roleAccess: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
    },
    {
      title: intl.formatMessage({ defaultMessage: 'Subscriptions', id: 'Home / Subscriptions / Title' }),
      subtitle: intl.formatMessage({
        defaultMessage: 'Example of subscription management.',
        id: 'Home / Subscriptions / Subtitle',
      }),
      link: generateTenantPath(RoutesConfig.subscriptions.index),
      roleAccess: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
    },
    {
      title: intl.formatMessage({ defaultMessage: 'Open AI integration', id: 'Home / Open AI / Title' }),
      subtitle: intl.formatMessage({
        defaultMessage: 'SaaS ideas generator as an example of Open AI integration.',
        id: 'Home / Open AI / Subtitle',
      }),
      link: generateLocalePath(RoutesConfig.saasIdeas),
    },
    {
      title: intl.formatMessage({ defaultMessage: 'Content items', id: 'Home / CMD items / Title' }),
      subtitle: intl.formatMessage({
        defaultMessage: 'Demo of the Contentful integration.',
        id: 'Home / CMD items / Subtitle',
      }),
      link: generateLocalePath(RoutesConfig.demoItems),
    },
    {
      title: intl.formatMessage({ defaultMessage: 'Documents', id: 'Home / Documents / Title' }),
      subtitle: intl.formatMessage({
        defaultMessage: 'File upload and asset management example.',
        id: 'Home / Documents / Subtitle',
      }),
      link: generateLocalePath(RoutesConfig.documents),
    },
    {
      title: intl.formatMessage({ defaultMessage: 'CRUD', id: 'Home / CRUD / Title' }),
      subtitle: intl.formatMessage({
        defaultMessage: 'Create-Read-Update-Delete module example that is generated by built-in generator.',
        id: 'Home / CRUD / Subtitle',
      }),
      link: generateLocalePath(RoutesConfig.crudDemoItem.list),
    },
  ];

  const renderItem = (item: DashboardItem, key: number) => (
    <TenantRoleAccess allowedRoles={item.roleAccess} key={key}>
      <Link navLink to={item.link} className="group block h-full">
        <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-relaxed">{item.subtitle}</CardDescription>
          </CardContent>
        </Card>
      </Link>
    </TenantRoleAccess>
  );

  // Check if we have any real activity data
  const hasActivityData = activityData.some((d) => d.count > 0);
  const hasDataDistribution = dataDistribution.some((d) => d.value > 0);

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Homepage',
          id: 'Home / page title',
        })}
      />

      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Dashboard" id="Home / header" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="Welcome! You're viewing your personal application dashboard example."
              id="Home / subheading"
            />
          </Paragraph>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title={intl.formatMessage({ defaultMessage: 'CRUD Items', id: 'Dashboard / CRUD Items' })}
                value={stats.crudItems}
                description={intl.formatMessage({
                  defaultMessage: 'Total items in your organization',
                  id: 'Dashboard / CRUD Items description',
                })}
                icon={<Database className="h-5 w-5" />}
                accentColor={chartColors.brandGreen}
              />
              <StatCard
                title={intl.formatMessage({ defaultMessage: 'Documents', id: 'Dashboard / Documents' })}
                value={stats.documents}
                description={intl.formatMessage({
                  defaultMessage: 'Uploaded files',
                  id: 'Dashboard / Documents description',
                })}
                icon={<FileText className="h-5 w-5" />}
                accentColor={chartColors.brandLimeGreen}
              />
              <StatCard
                title={intl.formatMessage({ defaultMessage: 'Team Members', id: 'Dashboard / Team Members' })}
                value={stats.members}
                description={
                  stats.pendingInvites > 0
                    ? intl.formatMessage(
                        { defaultMessage: '{count} pending invites', id: 'Dashboard / Pending invites' },
                        { count: stats.pendingInvites }
                      )
                    : intl.formatMessage({
                        defaultMessage: 'Active members',
                        id: 'Dashboard / Active members',
                      })
                }
                icon={<Users className="h-5 w-5" />}
                accentColor={chartColors.brandYellowGreen}
              />
              <StatCard
                title={intl.formatMessage({ defaultMessage: 'Notifications', id: 'Dashboard / Notifications' })}
                value={stats.notifications}
                description={
                  stats.unreadNotifications > 0
                    ? intl.formatMessage(
                        { defaultMessage: '{count} unread', id: 'Dashboard / Unread notifications' },
                        { count: stats.unreadNotifications }
                      )
                    : intl.formatMessage({
                        defaultMessage: 'All caught up!',
                        id: 'Dashboard / All caught up',
                      })
                }
                icon={<Bell className="h-5 w-5" />}
                accentColor={chartColors.brandYellow}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Activity Chart */}
          <ChartContainer
            title={intl.formatMessage({ defaultMessage: 'Activity Overview', id: 'Dashboard / Activity title' })}
            description={intl.formatMessage({
              defaultMessage: 'Notifications over the last 7 days',
              id: 'Dashboard / Activity description',
            })}
            action={
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FFFE25] to-[#42F272] px-2.5 py-1 text-xs font-medium text-black">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Live</span>
              </div>
            }
          >
            {statsLoading ? (
              <Skeleton className="h-64" />
            ) : hasActivityData ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <ChartGradients />
                  <CartesianGrid vertical={false} {...gridDefaults} />
                  <XAxis dataKey="day" {...axisDefaults} tickLine={false} axisLine={false} dy={10} />
                  <YAxis {...axisDefaults} tickLine={false} axisLine={false} allowDecimals={false} dx={-10} />
                  <ChartTooltip
                    title="Activity"
                    labelFormatter={(label) => label}
                    formatter={(value) => `${value ?? 0} events`}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="url(#gradientBrand)"
                    fill="url(#gradientMixed)"
                    strokeWidth={3}
                    name="Activities"
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2, fill: chartColors.brandGreen, stroke: 'white' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmptyState
                message={intl.formatMessage({
                  defaultMessage: 'No activity in the last 7 days',
                  id: 'Dashboard / No activity',
                })}
              />
            )}
          </ChartContainer>

          {/* Data Distribution Chart */}
          <ChartContainer
            title={intl.formatMessage({ defaultMessage: 'Data Distribution', id: 'Dashboard / Data title' })}
            description={intl.formatMessage({
              defaultMessage: 'Breakdown of your stored data',
              id: 'Dashboard / Data description',
            })}
          >
            {statsLoading ? (
              <Skeleton className="h-64" />
            ) : hasDataDistribution ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dataDistribution} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <ChartGradients />
                  <CartesianGrid horizontal={false} {...gridDefaults} />
                  <XAxis type="number" {...axisDefaults} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    {...axisDefaults}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <ChartTooltip
                    title="Data Count"
                    formatter={(value, name) => `${value ?? 0} ${name === 'CRUD Items' ? 'items' : name === 'Documents' ? 'files' : 'total'}`}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Count" maxBarSize={40} fill="url(#gradientBar)">
                    {dataDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="url(#gradientBar)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmptyState
                message={intl.formatMessage({
                  defaultMessage: 'No data yet. Start creating items!',
                  id: 'Dashboard / No data',
                })}
              />
            )}
          </ChartContainer>
        </div>

        {/* Team Roles Pie Chart - Only for admins/owners */}
        <TenantRoleAccess allowedRoles={[TenantUserRole.OWNER, TenantUserRole.ADMIN]}>
          <div className="grid gap-6 lg:grid-cols-3">
            <ChartContainer
              title={intl.formatMessage({ defaultMessage: 'Team Roles', id: 'Dashboard / Roles title' })}
              description={intl.formatMessage({
                defaultMessage: 'Distribution of team member roles',
                id: 'Dashboard / Roles description',
              })}
              className="lg:col-span-1"
            >
              {statsLoading ? (
                <Skeleton className="h-48" />
              ) : roleDistribution.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <ChartGradients />
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        title="Team Roles"
                        formatter={(value) => `${value ?? 0} member${(value ?? 0) !== 1 ? 's' : ''}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {roleDistribution.map((role) => (
                      <ChartLegendItem key={role.name} color={role.color} label={role.name} value={role.value} />
                    ))}
                  </div>
                </>
              ) : (
                <ChartEmptyState
                  message={intl.formatMessage({ defaultMessage: 'No team data available', id: 'Dashboard / No team data' })}
                />
              )}
            </ChartContainer>

            {/* Quick Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  <FormattedMessage defaultMessage="Quick Actions" id="Dashboard / Quick Actions" />
                </CardTitle>
                <CardDescription>
                  <FormattedMessage
                    defaultMessage="Common tasks and resources"
                    id="Dashboard / Quick Actions description"
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" size="lg" asChild className="justify-start gap-2">
                    <a
                      href="https://github.com/apptension/saas-boilerplate"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center"
                    >
                      <Github className="h-4 w-4" />
                      <span>GitHub Repository</span>
                      <ArrowUpRight className="ml-auto h-3 w-3" />
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="justify-start gap-2">
                    <a
                      href="https://docs.demo.saas.apptoku.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Documentation</span>
                      <ArrowUpRight className="ml-auto h-3 w-3" />
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="justify-start gap-2">
                    <Link to={generateTenantPath(RoutesConfig.crudDemoItem.list)}>
                      <Database className="h-4 w-4" />
                      <span>
                        <FormattedMessage defaultMessage="Manage CRUD Items" id="Dashboard / Manage CRUD" />
                      </span>
                      <ArrowUpRight className="ml-auto h-3 w-3" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="justify-start gap-2">
                    <Link to={generateTenantPath(RoutesConfig.tenant.settings.members)}>
                      <Users className="h-4 w-4" />
                      <span>
                        <FormattedMessage defaultMessage="Team Settings" id="Dashboard / Team Settings" />
                      </span>
                      <ArrowUpRight className="ml-auto h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TenantRoleAccess>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Getting Started Section - Takes 2 columns on large screens */}
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold tracking-tight">
                  {intl.formatMessage({ defaultMessage: 'Getting Started', id: 'Home / Getting Started / Title' })}
                </h2>
              </div>
              <Paragraph className="text-muted-foreground">
                {intl.formatMessage({
                  defaultMessage: 'Follow these steps to start developing with the SaaS Boilerplate.',
                  id: 'Home / Getting Started / Subtitle',
                })}
              </Paragraph>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Code2 className="h-5 w-5 text-primary" />
                    {intl.formatMessage({
                      defaultMessage: 'Development Commands',
                      id: 'Home / Development Commands / Title',
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">
                      {intl.formatMessage({ defaultMessage: 'Generate Code', id: 'Home / Development Commands / Generate' })}
                    </p>
                    <div className="space-y-1">
                      <code className="block rounded-md bg-muted px-3 py-2 text-sm">pnpm plop</code>
                      <p className="text-xs text-muted-foreground">
                        {intl.formatMessage({
                          defaultMessage: 'Generate components, CRUD modules, hooks, emails, and more (run from packages/webapp)',
                          id: 'Home / Development Commands / Plop Description',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">
                      {intl.formatMessage({ defaultMessage: 'Database', id: 'Home / Development Commands / Database' })}
                    </p>
                    <div className="space-y-1">
                      <code className="block rounded-md bg-muted px-3 py-2 text-sm">pnpm saas backend makemigrations</code>
                      <code className="block rounded-md bg-muted px-3 py-2 text-sm">pnpm saas backend migrate</code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">
                      {intl.formatMessage({ defaultMessage: 'Testing & Quality', id: 'Home / Development Commands / Testing' })}
                    </p>
                    <div className="space-y-1">
                      <code className="block rounded-md bg-muted px-3 py-2 text-sm">pnpm saas backend test</code>
                      <code className="block rounded-md bg-muted px-3 py-2 text-sm">pnpm saas test</code>
                      <code className="block rounded-md bg-muted px-3 py-2 text-sm">pnpm saas lint</code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    {intl.formatMessage({ defaultMessage: 'Admin Panel', id: 'Home / Admin Panel / Title' })}
                  </CardTitle>
                  <CardDescription>
                    {intl.formatMessage({
                      defaultMessage: 'Access the Django admin interface for managing data and performing administrative tasks',
                      id: 'Home / Admin Panel / Description',
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {intl.formatMessage({ defaultMessage: 'Access URL', id: 'Home / Admin Panel / URL Label' })}
                    </p>
                    <a
                      href="http://admin.localhost:5001"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <code className="rounded-md bg-muted px-3 py-1.5 font-mono text-sm">http://admin.localhost:5001</code>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">
                      {intl.formatMessage({ defaultMessage: 'Login Credentials', id: 'Home / Admin Panel / Credentials Title' })}
                    </p>
                    <dl className="space-y-3">
                      <div>
                        <dt className="mb-1 text-xs font-medium text-muted-foreground">
                          {intl.formatMessage({ defaultMessage: 'Email', id: 'Home / Admin Panel / Email Label' })}
                        </dt>
                        <dd className="flex items-center gap-2">
                          <code className="rounded-md bg-muted px-2.5 py-1.5 font-mono text-sm">admin@example.com</code>
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 text-xs font-medium text-muted-foreground">
                          {intl.formatMessage({ defaultMessage: 'Password', id: 'Home / Admin Panel / Password Label' })}
                        </dt>
                        <dd className="flex items-center gap-2">
                          <code className="rounded-md bg-muted px-2.5 py-1.5 font-mono text-sm">AvPZpabgj9Z8</code>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <Alert variant="default" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {intl.formatMessage({
                        defaultMessage: 'These credentials are for local development only. Always use strong, unique passwords in production!',
                        id: 'Home / Admin Panel / Security Warning',
                      })}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Server className="h-5 w-5 text-primary" />
                    {intl.formatMessage({ defaultMessage: 'Local Services', id: 'Home / Local Services / Title' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-2 text-sm">
                    {[
                      { name: 'Web App', url: 'http://localhost:3000', port: 'localhost:3000' },
                      { name: 'Backend API', url: 'http://localhost:5001', port: 'localhost:5001' },
                      { name: 'Workers Trigger', url: 'http://localhost:3005', port: 'localhost:3005' },
                      { name: 'Mailcatcher', url: 'http://localhost:1080', port: 'localhost:1080' },
                      { name: 'Documentation', url: 'http://localhost:3006', port: 'localhost:3006' },
                    ].map((service) => (
                      <div key={service.name} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{service.name}</span>
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <code className="text-xs">{service.port}</code>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Info Alert */}
              <Alert variant="info" className="border-blue-700/20 bg-blue-50 dark:bg-blue-950/20">
                <AlertCircle className="h-4 w-4 text-blue-700" />
                <AlertTitle className="text-base font-semibold text-blue-900 dark:text-blue-100">
                  {intl.formatMessage({ defaultMessage: 'Heads up!', id: 'Home / Alert / Title' })}
                </AlertTitle>
                <AlertDescription className="mt-2 space-y-3 text-sm text-blue-800 dark:text-blue-200">
                  <p>
                    {intl.formatMessage({
                      defaultMessage:
                        "Each feature you see here is a module demonstrating the versatility and usability of the SaaS Boilerplate. Please remember, these modules are simply examples. You are encouraged to customize, adjust, and modify each module to best fit your application's needs.",
                      id: 'Home / Alert / Description',
                    })}
                  </p>
                  <p className="font-medium">
                    {intl.formatMessage({
                      defaultMessage: 'Remember, the SaaS Boilerplate is your starting point - make it your own!',
                      id: 'Home / Alert / Call to Action',
                    })}
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Available Features Section - Takes 1 column on large screens */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold tracking-tight">
                {intl.formatMessage({ defaultMessage: 'Available Features', id: 'Home / Features / Title' })}
              </h2>
            </div>
            <div className="grid w-full grid-cols-1 gap-4">{dashboardItems.map((item, key) => renderItem(item, key))}</div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
