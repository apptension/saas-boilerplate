import { TenantUserRole } from '@sb/webapp-api-client';
import { Link } from '@sb/webapp-core/components/buttons';
import { Button } from '@sb/webapp-core/components/ui/button';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@sb/webapp-core/components/ui/tooltip';
import { useGenerateLocalePath, useMediaQuery } from '@sb/webapp-core/hooks';
import { useTheme } from '@sb/webapp-core/hooks/useTheme/useTheme';
import { cn } from '@sb/webapp-core/lib/utils';
import { Themes } from '@sb/webapp-core/providers/themeProvider';
import { media } from '@sb/webapp-core/theme';
import { PermissionGate } from '@sb/webapp-tenants/components/permissionGate';
import { TenantRoleAccess } from '@sb/webapp-tenants/components/tenantRoleAccess';
import { TenantSwitchSidebar } from '@sb/webapp-tenants/components/tenantSwitch';
import { useCurrentTenantRole, useGenerateTenantPath, usePermissionCheck, PermissionCode } from '@sb/webapp-tenants/hooks';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Scale,
  Shield,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { HTMLAttributes, ReactNode, useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { Role } from '../../../../modules/auth/auth.types';
import { useAuth } from '../../../hooks';
import { RoleAccess } from '../../roleAccess';
import { LayoutContext } from '../layout.context';
import { SidebarExpandableItem, ExpandableMenuItem } from './sidebarExpandableItem';
import { SidebarLogo } from './sidebarLogo';

type MenuItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
  tenantRoles: TenantUserRole[];
  permissions?: PermissionCode[]; // New: permission-based access
  generatePath: () => string;
};

type ExpandableMenuSection = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ExpandableMenuItem[];
  roles: Role[];
  tenantRoles: TenantUserRole[];
  permissions?: PermissionCode[]; // New: permission-based access
};

type MenuSection = {
  id: string;
  label: ReactNode;
  items: MenuItem[];
  expandableSections?: ExpandableMenuSection[];
};

export const Sidebar = (props: HTMLAttributes<HTMLDivElement>) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const generateTenantPath = useGenerateTenantPath();
  const { pathname } = useLocation();
  const { setSideMenuOpen, isSideMenuOpen, isSidebarCollapsed, toggleSidebar } = useContext(LayoutContext);
  const { matches: isDesktop } = useMediaQuery({
    above: media.Breakpoint.DESKTOP,
  });
  const { isLoggedIn, currentUser } = useAuth();
  const { theme } = useTheme();
  const currentTenantRole = useCurrentTenantRole();
  const userRoles = currentUser?.roles || [];

  // Get user's permissions for permission-based menu items
  const { userPermissions } = usePermissionCheck([]);

  const closeSidebar = useCallback(() => setSideMenuOpen(false), [setSideMenuOpen]);

  // Helper to check if user has a specific permission
  const hasPermission = useCallback((permissionCode: PermissionCode): boolean => {
    return userPermissions.includes(permissionCode);
  }, [userPermissions]);

  // Helper to check if user has any of the required permissions
  const hasAnyPermission = useCallback((permissions: PermissionCode[]): boolean => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some((p) => userPermissions.includes(p));
  }, [userPermissions]);

  // Helper to check if user has access to a menu item based on roles and permissions
  const hasAccessToItem = useCallback((item: MenuItem): boolean => {
    // If no roles or permissions required, allow access
    if (item.roles.length === 0 && item.tenantRoles.length === 0 && (!item.permissions || item.permissions.length === 0)) {
      return true;
    }
    // Check app-level roles
    if (item.roles.length > 0 && item.roles.some((role) => userRoles.includes(role))) {
      return true;
    }
    // Check tenant-level roles (legacy)
    if (item.tenantRoles.length > 0 && item.tenantRoles.some((role) => role === currentTenantRole)) {
      return true;
    }
    // Check permissions (new RBAC)
    if (item.permissions && item.permissions.length > 0 && hasAnyPermission(item.permissions)) {
      return true;
    }
    return false;
  }, [userRoles, currentTenantRole, hasAnyPermission]);

  // Helper to check if user has access to an expandable section
  const hasAccessToExpandableSection = useCallback((section: ExpandableMenuSection): boolean => {
    // If no roles or permissions required, allow access
    if (section.roles.length === 0 && section.tenantRoles.length === 0 && (!section.permissions || section.permissions.length === 0)) {
      return true;
    }
    // Check app-level roles
    if (section.roles.length > 0 && section.roles.some((role) => userRoles.includes(role))) {
      return true;
    }
    // Check tenant-level roles (legacy)
    if (section.tenantRoles.length > 0 && section.tenantRoles.some((role) => role === currentTenantRole)) {
      return true;
    }
    // Check permissions (new RBAC)
    if (section.permissions && section.permissions.length > 0 && hasAnyPermission(section.permissions)) {
      return true;
    }
    return false;
  }, [userRoles, currentTenantRole, hasAnyPermission]);

  // Helper to check if user has access to any item in a section
  const hasAccessToSection = useCallback((section: MenuSection): boolean => {
    const hasAccessToAnyItem = section.items.some(hasAccessToItem);
    const hasAccessToAnyExpandable = section.expandableSections?.some(hasAccessToExpandableSection) ?? false;
    return hasAccessToAnyItem || hasAccessToAnyExpandable;
  }, [hasAccessToItem, hasAccessToExpandableSection]);

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

  const menuSections: MenuSection[] = [
    {
      id: 'overview',
      label: <FormattedMessage defaultMessage="Overview" id="Sidebar / Overview section" />,
      items: [
        {
          path: RoutesConfig.home,
          label: intl.formatMessage({ defaultMessage: 'Dashboard', id: 'Home / dashboard link' }),
          icon: LayoutDashboard,
          roles: [],
          tenantRoles: [],
          generatePath: () => generateTenantPath(RoutesConfig.home),
        },
      ],
    },
    {
      id: 'billing',
      label: <FormattedMessage defaultMessage="Billing" id="Sidebar / Billing section" />,
      items: [
        {
          path: RoutesConfig.finances.paymentConfirm,
          label: intl.formatMessage({ defaultMessage: 'Payments', id: 'Home / payments link' }),
          icon: Wallet,
          roles: [],
          tenantRoles: [],
          permissions: ['billing.view'],
          generatePath: () => generateTenantPath(RoutesConfig.finances.paymentConfirm),
        },
        {
          path: RoutesConfig.subscriptions.index,
          label: intl.formatMessage({ defaultMessage: 'Subscriptions', id: 'Home / subscriptions link' }),
          icon: CreditCard,
          roles: [],
          tenantRoles: [],
          permissions: ['billing.view'],
          generatePath: () => generateTenantPath(RoutesConfig.subscriptions.index),
        },
      ],
    },
    {
      id: 'features',
      label: <FormattedMessage defaultMessage="Features" id="Sidebar / Features section" />,
      items: [
        {
          path: RoutesConfig.saasIdeas,
          label: intl.formatMessage({ defaultMessage: 'OpenAI Integration', id: 'Home / openai integration link' }),
          icon: Sparkles,
          roles: [],
          tenantRoles: [],
          permissions: ['features.ai.use'],
          generatePath: () => generateLocalePath(RoutesConfig.saasIdeas),
        },
        {
          path: RoutesConfig.demoItems,
          label: intl.formatMessage({ defaultMessage: 'Content items', id: 'Home / content items link' }),
          icon: FolderOpen,
          roles: [],
          tenantRoles: [],
          permissions: ['features.content.view'],
          generatePath: () => generateLocalePath(RoutesConfig.demoItems),
        },
        {
          path: RoutesConfig.documents,
          label: intl.formatMessage({ defaultMessage: 'Documents', id: 'Home / documents link' }),
          icon: FileText,
          roles: [],
          tenantRoles: [],
          permissions: ['features.documents.view'],
          generatePath: () => generateLocalePath(RoutesConfig.documents),
        },
        {
          path: RoutesConfig.crudDemoItem.list,
          label: intl.formatMessage({ defaultMessage: 'CRUD', id: 'Home / CRUD link' }),
          icon: Database,
          roles: [],
          tenantRoles: [],
          permissions: ['features.crud.view'],
          generatePath: () => generateTenantPath(RoutesConfig.crudDemoItem.list),
        },
      ],
    },
    {
      id: 'administration',
      label: <FormattedMessage defaultMessage="Administration" id="Sidebar / Administration section" />,
      items: [
        {
          path: RoutesConfig.admin,
          label: intl.formatMessage({ defaultMessage: 'Admin panel', id: 'Home / admin link' }),
          icon: Shield,
          roles: [Role.ADMIN],
          tenantRoles: [],
          generatePath: () => generateLocalePath(RoutesConfig.admin),
        },
        {
          path: RoutesConfig.tenant.settings.members,
          label: intl.formatMessage({ defaultMessage: 'Organization', id: 'Home / organization settings' }),
          icon: Building2,
          roles: [],
          tenantRoles: [],
          permissions: ['org.settings.view', 'members.view'],
          generatePath: () => generateTenantPath(RoutesConfig.tenant.settings.members),
        },
      ],
    },
    {
      id: 'legal',
      label: <FormattedMessage defaultMessage="Legal" id="Sidebar / Legal section" />,
      items: [
        {
          path: RoutesConfig.privacyPolicy,
          label: intl.formatMessage({ defaultMessage: 'Privacy policy', id: 'Home / privacy policy link' }),
          icon: FileText,
          roles: [],
          tenantRoles: [],
          generatePath: () => generateLocalePath(RoutesConfig.privacyPolicy),
        },
        {
          path: RoutesConfig.termsAndConditions,
          label: intl.formatMessage({ defaultMessage: 'Terms and conditions', id: 'Home / t&c link' }),
          icon: Scale,
          roles: [],
          tenantRoles: [],
          generatePath: () => generateLocalePath(RoutesConfig.termsAndConditions),
        },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const content = (
      <Link to={item.generatePath()} onClick={closeSidebar} navLink className={menuItemClassName({ isActive: active })}>
        <Icon className="h-5 w-5 shrink-0" />
        {(!isSidebarCollapsed || !isDesktop) && <span className="truncate">{item.label}</span>}
      </Link>
    );

    const wrappedContent =
      isSidebarCollapsed && isDesktop ? (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ) : (
        content
      );

    // Check app-level roles first
    if (item.roles.length > 0) {
      return (
        <RoleAccess allowedRoles={item.roles} key={item.path}>
          {wrappedContent}
        </RoleAccess>
      );
    }

    // Then check permission-based access (new RBAC)
    if (item.permissions && item.permissions.length > 0) {
      return (
        <PermissionGate permissions={item.permissions} mode="any" key={item.path}>
          {wrappedContent}
        </PermissionGate>
      );
    }

    // Legacy: check tenant roles
    if (item.tenantRoles.length > 0) {
      return (
        <TenantRoleAccess allowedRoles={item.tenantRoles} key={item.path}>
          {wrappedContent}
        </TenantRoleAccess>
      );
    }

    return <div key={item.path}>{wrappedContent}</div>;
  };

  const renderExpandableSection = (expandable: ExpandableMenuSection) => {
    // Filter items based on their individual permissions
    const filteredItems = expandable.items.filter((item) => {
      // Dividers are always shown (they have type: 'divider')
      if ('type' in item && item.type === 'divider') {
        return true;
      }
      // Links: check permissions
      const linkItem = item as { permissions?: string[] };
      if (!linkItem.permissions || linkItem.permissions.length === 0) {
        return true; // No permissions required
      }
      return linkItem.permissions.some((p) => userPermissions.includes(p));
    });

    // If no items remain after filtering (excluding dividers), don't show the section
    const hasVisibleItems = filteredItems.some(
      (item) => !('type' in item && item.type === 'divider')
    );
    if (!hasVisibleItems) {
      return null;
    }

    const content = (
      <SidebarExpandableItem
        key={expandable.id}
        label={expandable.label}
        icon={expandable.icon}
        items={filteredItems}
        isActive={isActive}
        isCollapsed={isSidebarCollapsed && isDesktop}
        isDesktop={isDesktop}
        onItemClick={closeSidebar}
      />
    );

    // Check app-level roles first
    if (expandable.roles.length > 0) {
      return (
        <RoleAccess allowedRoles={expandable.roles} key={expandable.id}>
          {content}
        </RoleAccess>
      );
    }

    // Then check permission-based access (new RBAC)
    if (expandable.permissions && expandable.permissions.length > 0) {
      return (
        <PermissionGate permissions={expandable.permissions} mode="any" key={expandable.id}>
          {content}
        </PermissionGate>
      );
    }

    // Legacy: check tenant roles
    if (expandable.tenantRoles.length > 0) {
      return (
        <TenantRoleAccess allowedRoles={expandable.tenantRoles} key={expandable.id}>
          {content}
        </TenantRoleAccess>
      );
    }

    return <div key={expandable.id}>{content}</div>;
  };

  const renderSection = (section: MenuSection, index: number, visibleIndex: number) => {
    // Don't render the section if user doesn't have access to any items
    if (!hasAccessToSection(section)) {
      return null;
    }

    return (
      <div key={section.id} className="flex flex-col gap-1">
        {visibleIndex > 0 && <Separator className="my-2" />}
        {(!isSidebarCollapsed || !isDesktop) && (
          <span className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {section.label}
          </span>
        )}
        {section.items.map(renderMenuItem)}
        {section.expandableSections?.map(renderExpandableSection)}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn('pointer-events-none fixed inset-0 z-50 bg-black/80 opacity-0 transition-opacity xl:hidden', {
          'pointer-events-auto opacity-100': isSideMenuOpen,
        })}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Mobile close button */}
      {isSideMenuOpen && !isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-[280px] top-4 z-60 xl:hidden"
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
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300',
          'xl:translate-x-0',
          {
            '-translate-x-full xl:translate-x-0': !isSideMenuOpen && !isDesktop,
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
              <SidebarLogo
                isCollapsed={isSidebarCollapsed && isDesktop}
                logoColor={theme === Themes.DARK ? 'white' : 'black'}
                to={generateTenantPath(RoutesConfig.home)}
                onLogoClick={closeSidebar}
              />
            </div>

            {/* Tenant Switch */}
            {isLoggedIn && (
              <div
                className={cn('px-0', {
                  'flex justify-center': isSidebarCollapsed && isDesktop,
                })}
              >
                <TenantSwitchSidebar collapsed={isSidebarCollapsed && isDesktop} />
              </div>
            )}
          </div>

          {/* Menu items */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
            <div className="flex flex-col">
              {(() => {
                let visibleIndex = 0;
                return menuSections.map((section, index) => {
                  // Legal section is always visible, other sections require login
                  if (section.id === 'legal') {
                    const result = renderSection(section, index, visibleIndex);
                    if (result) visibleIndex++;
                    return result;
                  }
                  if (!isLoggedIn) return null;
                  const result = renderSection(section, index, visibleIndex);
                  if (result) visibleIndex++;
                  return result;
                });
              })()}
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
