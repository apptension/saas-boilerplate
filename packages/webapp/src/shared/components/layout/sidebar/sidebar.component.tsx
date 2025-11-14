import { TenantUserRole } from '@sb/webapp-api-client';
import { Link } from '@sb/webapp-core/components/buttons';
import { Button } from '@sb/webapp-core/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@sb/webapp-core/components/ui/tooltip';
import { useGenerateLocalePath, useMediaQuery } from '@sb/webapp-core/hooks';
import { useTheme } from '@sb/webapp-core/hooks/useTheme/useTheme';
import { Themes } from '@sb/webapp-core/providers/themeProvider';
import { cn } from '@sb/webapp-core/lib/utils';
import { media } from '@sb/webapp-core/theme';
import { TenantRoleAccess } from '@sb/webapp-tenants/components/tenantRoleAccess';
import { TenantSwitchSidebar } from '@sb/webapp-tenants/components/tenantSwitch';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Wallet,
  CreditCard,
  Sparkles,
  FolderOpen,
  Database,
  Shield,
  Building2,
  X,
} from 'lucide-react';
import { HTMLAttributes, useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { useAuth } from '../../../hooks';
import { Role } from '../../../../modules/auth/auth.types';
import { RoleAccess } from '../../roleAccess';
import { LogoIcon } from '../../../../images/icons';
import { LayoutContext } from '../layout.context';

export const Sidebar = (props: HTMLAttributes<HTMLDivElement>) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const generateTenantPath = useGenerateTenantPath();
  const { pathname } = useLocation();
  const { setSideMenuOpen, isSideMenuOpen, isSidebarCollapsed, toggleSidebar } = useContext(LayoutContext);
  const { matches: isDesktop } = useMediaQuery({
    above: media.Breakpoint.TABLET,
  });
  const { isLoggedIn } = useAuth();
  const { theme } = useTheme();

  const closeSidebar = useCallback(() => setSideMenuOpen(false), [setSideMenuOpen]);

  const menuItemClassName = ({ isActive = false }: { isActive?: boolean }) =>
    cn(
      'flex items-center rounded-md text-sm font-medium transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      {
        'justify-center px-0 py-2.5': isSidebarCollapsed && isDesktop,
        'gap-3 px-3 py-2.5': !isSidebarCollapsed || !isDesktop,
      'bg-accent text-accent-foreground': isActive,
        'text-muted-foreground': !isActive,
      }
    );

  const isActive = (path: string) => {
    if (path === RoutesConfig.home) {
      return pathname === generateTenantPath(RoutesConfig.home);
    }
    return pathname.includes(path);
  };

  const menuItems = [
    {
      path: RoutesConfig.home,
      label: intl.formatMessage({ defaultMessage: 'Dashboard', id: 'Home / dashboard link' }),
      icon: LayoutDashboard,
      roles: [],
      tenantRoles: [],
      generatePath: () => generateTenantPath(RoutesConfig.home),
    },
    {
      path: RoutesConfig.finances.paymentConfirm,
      label: intl.formatMessage({ defaultMessage: 'Payments', id: 'Home / payments link' }),
      icon: Wallet,
      roles: [],
      tenantRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
      generatePath: () => generateTenantPath(RoutesConfig.finances.paymentConfirm),
    },
    {
      path: RoutesConfig.subscriptions.index,
      label: intl.formatMessage({ defaultMessage: 'Subscriptions', id: 'Home / subscriptions link' }),
      icon: CreditCard,
      roles: [],
      tenantRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
      generatePath: () => generateTenantPath(RoutesConfig.subscriptions.index),
    },
    {
      path: RoutesConfig.saasIdeas,
      label: intl.formatMessage({ defaultMessage: 'OpenAI Integration', id: 'Home / openai integration link' }),
      icon: Sparkles,
      roles: [],
      tenantRoles: [],
      generatePath: () => generateLocalePath(RoutesConfig.saasIdeas),
    },
    {
      path: RoutesConfig.demoItems,
      label: intl.formatMessage({ defaultMessage: 'Content items', id: 'Home / content items link' }),
      icon: FolderOpen,
      roles: [],
      tenantRoles: [],
      generatePath: () => generateLocalePath(RoutesConfig.demoItems),
    },
    {
      path: RoutesConfig.documents,
      label: intl.formatMessage({ defaultMessage: 'Documents', id: 'Home / documents link' }),
      icon: FileText,
      roles: [],
      tenantRoles: [],
      generatePath: () => generateLocalePath(RoutesConfig.documents),
    },
    {
      path: RoutesConfig.crudDemoItem.list,
      label: intl.formatMessage({ defaultMessage: 'CRUD', id: 'Home / CRUD link' }),
      icon: Database,
      roles: [],
      tenantRoles: [],
      generatePath: () => generateTenantPath(RoutesConfig.crudDemoItem.list),
    },
    {
      path: RoutesConfig.admin,
      label: intl.formatMessage({ defaultMessage: 'Admin', id: 'Home / admin link' }),
      icon: Shield,
      roles: [Role.ADMIN],
      tenantRoles: [],
      generatePath: () => generateLocalePath(RoutesConfig.admin),
    },
    {
      path: RoutesConfig.tenant.settings.members,
      label: intl.formatMessage({ defaultMessage: 'Organization settings', id: 'Home / organization settings' }),
      icon: Building2,
      roles: [],
      tenantRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
      generatePath: () => generateTenantPath(RoutesConfig.tenant.settings.members),
    },
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const content = (
      <Link
        to={item.generatePath()}
        onClick={closeSidebar}
        navLink
        className={menuItemClassName({ isActive: active })}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {(!isSidebarCollapsed || !isDesktop) && <span className="truncate">{item.label}</span>}
      </Link>
    );

    if (item.roles.length > 0) {
      return (
        <RoleAccess allowedRoles={item.roles} key={item.path}>
          {isSidebarCollapsed && isDesktop ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            content
          )}
        </RoleAccess>
      );
    }

    if (item.tenantRoles.length > 0) {
      return (
        <TenantRoleAccess allowedRoles={item.tenantRoles} key={item.path}>
          {isSidebarCollapsed && isDesktop ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            content
          )}
        </TenantRoleAccess>
      );
    }

    return isSidebarCollapsed && isDesktop ? (
      <Tooltip key={item.path} delayDuration={200}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    ) : (
      <div key={item.path}>{content}</div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-20 bg-black/80 opacity-0 transition-opacity lg:hidden',
          {
            'pointer-events-auto opacity-100': isSideMenuOpen,
          }
        )}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Mobile close button */}
      {isSideMenuOpen && !isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-[280px] top-4 z-30 lg:hidden"
        onClick={closeSidebar}
        aria-label={intl.formatMessage({
          defaultMessage: 'Close menu',
          id: 'Home / close sidebar icon label',
        })}
      >
          <X className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside
        {...props}
        className={cn(
          'fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-background transition-all duration-300',
          'lg:translate-x-0',
          {
            '-translate-x-full lg:translate-x-0': !isSideMenuOpen && !isDesktop,
            'translate-x-0': isSideMenuOpen || isDesktop,
            'w-16': isSidebarCollapsed && isDesktop,
            'w-72': !isSidebarCollapsed || !isDesktop,
          },
          props.className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Top section: Logo and Tenant Switch */}
          <div className="flex flex-col gap-4 border-b p-4">
            {/* Logo */}
            <div className="flex items-center justify-center">
              <Link
                to={generateTenantPath(RoutesConfig.home)}
                onClick={closeSidebar}
                className="flex items-center justify-center"
                aria-label={intl.formatMessage({
                  id: 'Header / Home link aria label',
                  defaultMessage: 'Go back home',
                })}
              >
                <div className={cn('flex items-center justify-center', {
                  'h-8 w-8': isSidebarCollapsed && isDesktop,
                  'w-[120px]': !isSidebarCollapsed || !isDesktop,
                })}>
                  <LogoIcon
                    color={theme === Themes.DARK ? 'white' : 'black'}
                    className={cn('h-auto w-full', {
                      'h-8 w-8': isSidebarCollapsed && isDesktop,
                    })}
                    style={{ maxWidth: '100%' }}
                    preserveAspectRatio="xMidYMid meet"
                  />
                </div>
              </Link>
            </div>

            {/* Tenant Switch */}
            {isLoggedIn && (
              <div className={cn('px-0', {
                'flex justify-center': isSidebarCollapsed && isDesktop,
              })}>
                <TenantSwitchSidebar collapsed={isSidebarCollapsed && isDesktop} />
              </div>
            )}
          </div>

          {/* Menu items */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
            <div className="flex flex-col gap-1">
              {menuItems.map(renderMenuItem)}
            </div>
          </nav>

          {/* Bottom section: Toggle button and User panel */}
          <div className="border-t">
            {/* Toggle sidebar button */}
            {isDesktop && (
              <div className="p-2">
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSidebar}
                      className={cn('w-full justify-start', {
                        'justify-center px-0': isSidebarCollapsed,
                      })}
                      aria-label={intl.formatMessage({
                        defaultMessage: 'Toggle sidebar',
                        id: 'Sidebar / Toggle sidebar',
                      })}
                    >
                      {isSidebarCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <>
                          <ChevronLeft className="h-4 w-4" />
                          <span className="ml-2">
                            <FormattedMessage defaultMessage="Collapse" id="Sidebar / Collapse" />
                          </span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {isSidebarCollapsed && (
                    <TooltipContent side="right">
                      <FormattedMessage defaultMessage="Expand sidebar" id="Sidebar / Expand sidebar" />
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            )}

          </div>
        </div>
      </aside>
    </>
  );
};
