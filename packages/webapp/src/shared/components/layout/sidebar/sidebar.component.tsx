import { TenantUserRole } from '@sb/webapp-api-client';
import { Link } from '@sb/webapp-core/components/buttons';
import { Alert, AlertDescription, AlertTitle } from '@sb/webapp-core/components/ui/alert';
import { buttonVariants } from '@sb/webapp-core/components/ui/button';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { useGenerateLocalePath, useMediaQuery } from '@sb/webapp-core/hooks';
import { cn } from '@sb/webapp-core/lib/utils';
import { media } from '@sb/webapp-core/theme';
import { TenantRoleAccess } from '@sb/webapp-tenants/components/tenantRoleAccess';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { X } from 'lucide-react';
import { HTMLAttributes, useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../../app/config/routes';
import { HeaderLogoDarkIcon, HeaderLogoIcon } from '../../../../images/icons';
import { Role } from '../../../../modules/auth/auth.types';
import { RoleAccess } from '../../roleAccess';
import { LayoutContext } from '../layout.context';

export const Sidebar = (props: HTMLAttributes<HTMLDivElement>) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const generateTenantPath = useGenerateTenantPath();
  const { setSideMenuOpen, isSideMenuOpen } = useContext(LayoutContext);
  const { matches: isDesktop } = useMediaQuery({
    above: media.Breakpoint.TABLET,
  });

  const closeSidebar = useCallback(() => setSideMenuOpen(false), [setSideMenuOpen]);

  const menuItemClassName = ({ isActive = false }) =>
    cn(buttonVariants({ variant: 'ghost' }), 'justify-start', {
      'bg-accent text-accent-foreground': isActive,
    });

  return (
    <>
      <div
        className={cn('pointer-events-none fixed inset-0 z-20 bg-black/80 opacity-0 transition-opacity lg:hidden', {
          'pointer-events-auto opacity-100': isSideMenuOpen,
        })}
        onClick={closeSidebar}
      ></div>
      <div
        className={cn(
          'fixed left-80 top-6 z-20 cursor-pointer text-white opacity-0 transition-opacity lg:pointer-events-none lg:hidden',
          {
            'block opacity-100 lg:hidden': isSideMenuOpen,
          }
        )}
        role="button"
        onClick={closeSidebar}
        aria-label={intl.formatMessage({
          defaultMessage: 'Close menu',
          id: 'Home / close sidebar icon label',
        })}
      >
        <X size={24} />
      </div>
      <div
        {...props}
        className={cn(
          'fixed inset-y-0 -left-72 z-20 flex w-72 border-r bg-background transition-transform duration-300 lg:left-0 lg:transition-none',
          {
            'translate-x-72 lg:translate-x-0': isSideMenuOpen,
          },
          props.className
        )}
      >
        <div className="flex grow flex-col gap-y-3">
          <div className="flex grow flex-col gap-y-7 overflow-auto px-6">
            <div className="flex h-16 items-center">
              <Link
                to={generateTenantPath(RoutesConfig.home)}
                aria-label={intl.formatMessage({
                  id: 'Header / Home link aria label',
                  defaultMessage: 'Go back home',
                })}
              >
                <HeaderLogoIcon className="block h-14 w-52 dark:hidden" />
                <HeaderLogoDarkIcon className="hidden h-14 w-52 dark:block" />
              </Link>
            </div>

            <nav className="-mx-2 flex grow flex-col gap-y-1">
              <RoleAccess>
                <Link
                  className={menuItemClassName}
                  to={generateTenantPath(RoutesConfig.home)}
                  onClick={closeSidebar}
                  navLink
                  end
                >
                  <FormattedMessage defaultMessage="Dashboard" id="Home / dashboard link" />
                </Link>
              </RoleAccess>

              <TenantRoleAccess allowedRoles={[TenantUserRole.OWNER, TenantUserRole.ADMIN]}>
                <Link
                  className={menuItemClassName}
                  to={generateTenantPath(RoutesConfig.finances.paymentConfirm)}
                  onClick={closeSidebar}
                  navLink
                >
                  <FormattedMessage defaultMessage="Payments" id="Home / payments link" />
                </Link>
              </TenantRoleAccess>

              <TenantRoleAccess allowedRoles={[TenantUserRole.OWNER, TenantUserRole.ADMIN]}>
                <Link
                  className={menuItemClassName}
                  to={generateTenantPath(RoutesConfig.subscriptions.index)}
                  onClick={closeSidebar}
                  navLink
                >
                  <FormattedMessage defaultMessage="Subscriptions" id="Home / subscriptions link" />
                </Link>
              </TenantRoleAccess>

              <RoleAccess>
                <Link
                  className={menuItemClassName}
                  to={generateLocalePath(RoutesConfig.saasIdeas)}
                  onClick={closeSidebar}
                  navLink
                >
                  <FormattedMessage defaultMessage="OpenAI Integration" id="Home / openai integration link" />
                </Link>
              </RoleAccess>

              <RoleAccess>
                <Link
                  className={menuItemClassName}
                  to={generateLocalePath(RoutesConfig.demoItems)}
                  onClick={closeSidebar}
                  navLink
                >
                  <FormattedMessage defaultMessage="Content items" id="Home / content items link" />
                </Link>
              </RoleAccess>

              <RoleAccess>
                <Link
                  className={menuItemClassName}
                  to={generateLocalePath(RoutesConfig.documents)}
                  onClick={closeSidebar}
                  navLink
                >
                  <FormattedMessage defaultMessage="Documents" id="Home / documents link" />
                </Link>
              </RoleAccess>

              <RoleAccess>
                <Link
                  className={menuItemClassName}
                  to={generateTenantPath(RoutesConfig.crudDemoItem.list)}
                  onClick={closeSidebar}
                  navLink
                >
                  <FormattedMessage defaultMessage="CRUD" id="Home / CRUD link" />
                </Link>
              </RoleAccess>

              <RoleAccess allowedRoles={Role.ADMIN}>
                <Link
                  className={menuItemClassName}
                  to={generateLocalePath(RoutesConfig.admin)}
                  onClick={closeSidebar}
                  navLink
                >
                  <FormattedMessage defaultMessage="Admin" id="Home / admin link" />
                </Link>
              </RoleAccess>

              <TenantRoleAccess allowedRoles={[TenantUserRole.OWNER, TenantUserRole.ADMIN]}>
                <Link
                  className={menuItemClassName}
                  to={generateTenantPath(RoutesConfig.tenant.settings.members)}
                  onClick={closeSidebar}
                  navLink
                >
                  <FormattedMessage defaultMessage="Organization settings" id="Home / organization settings" />
                </Link>
              </TenantRoleAccess>

              <p className="my-2 ml-2 mt-4 text-sm text-muted-foreground">
                <FormattedMessage defaultMessage="Static pages" id="Sidebar / static pages" />
              </p>

              <Link
                className={menuItemClassName}
                to={generateLocalePath(RoutesConfig.privacyPolicy)}
                onClick={closeSidebar}
                navLink
              >
                <FormattedMessage defaultMessage="Privacy policy" id="Home / privacy policy link" />
              </Link>

              <Link
                className={menuItemClassName}
                to={generateLocalePath(RoutesConfig.termsAndConditions)}
                onClick={closeSidebar}
                navLink
              >
                <FormattedMessage defaultMessage="Terms and conditions" id="Home / t&c link" />
              </Link>
            </nav>
            <Alert variant="info">
              <AlertTitle className="text-sm">
                SaaS Boilerplate by{' '}
                <a href="https://apptension.com" target="_blank" rel="noreferrer">
                  Apptension
                </a>
              </AlertTitle>
              <AlertDescription>
                <a
                  target="_blank"
                  className="underline"
                  href="https://github.com/apptension/saas-boilerplate"
                  rel="noreferrer"
                >
                  GitHub repository
                </a>
                <br />
                <a target="_blank" className="underline" href="https://docs.demo.saas.apptoku.com/" rel="noreferrer">
                  Documentation
                </a>
              </AlertDescription>
            </Alert>
          </div>
          <nav className="-mx-2 flex flex-col gap-y-1 px-6 pb-2">
            {!isDesktop && (
              <>
                <Separator />
                <RoleAccess>
                  <Link
                    className={menuItemClassName}
                    to={generateLocalePath(RoutesConfig.profile)}
                    onClick={closeSidebar}
                    navLink
                  >
                    <FormattedMessage defaultMessage="Profile" id="Home / Profile link" />
                  </Link>
                  <Link
                    className={menuItemClassName}
                    to={generateLocalePath(RoutesConfig.logout)}
                    onClick={closeSidebar}
                    navLink
                  >
                    <FormattedMessage defaultMessage="Logout" id="Home / Logout link" />
                  </Link>
                </RoleAccess>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};
