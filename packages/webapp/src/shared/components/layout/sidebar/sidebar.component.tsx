import closeIcon from '@iconify-icons/ion/close-outline';
import { Link } from '@sb/webapp-core/components/buttons';
import { Icon } from '@sb/webapp-core/components/icons';
import { useGenerateLocalePath, useMediaQuery } from '@sb/webapp-core/hooks';
import { cn } from '@sb/webapp-core/lib/utils';
import { media } from '@sb/webapp-core/theme';
import { HTMLAttributes, useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../../app/config/routes';
import { Role } from '../../../../modules/auth/auth.types';
import { RoleAccess } from '../../roleAccess';
import { LayoutContext } from '../layout.context';
import { Logo } from './sidebar.styles';

export const Sidebar = (props: HTMLAttributes<HTMLDivElement>) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const { setSideMenuOpen, isSideMenuOpen } = useContext(LayoutContext);
  const { matches: isDesktop } = useMediaQuery({ above: media.Breakpoint.TABLET });

  const closeSidebar = useCallback(() => setSideMenuOpen(false), [setSideMenuOpen]);

  const menuItemClassName = ({ isActive = false }) =>
    cn(
      'text-primary hover:bg-primary hover:text-primary-foreground rounded-md px-3 py-2 text-sm font-medium leading-6',
      {
        'bg-primary text-primary-foreground hover:bg-primary/90': isActive,
      }
    );
  return (
    <>
      <div
        className={cn('fixed lg:hidden inset-0 bg-black/80 pointer-events-none transition-opacity opacity-0', {
          'opacity-100 pointer-events-auto': isSideMenuOpen,
        })}
        onClick={closeSidebar}
      ></div>
      <div
        className={cn(
          'fixed top-6 left-80 lg:hidden lg:pointer-events-none cursor-pointer text-white opacity-0 transition-opacity',
          {
            'block lg:hidden opacity-100': isSideMenuOpen,
          }
        )}
        role="button"
        onClick={closeSidebar}
        aria-label={intl.formatMessage({
          defaultMessage: 'Close menu',
          id: 'Home / close sidebar icon label',
        })}
      >
        <Icon icon={closeIcon} />
      </div>
      <div
        {...props}
        className={cn(
          'fixed inset-y-0 flex w-72 bg-primary-foreground -left-72 lg:left-0 transition-transform lg:transition-none duration-300 border-r',
          {
            'translate-x-72 lg:translate-x-0': isSideMenuOpen,
          },
          props.className
        )}
      >
        <div className="px-6 overflow-auto flex flex-col grow gap-y-7">
          <div className="h-16 flex items-center">
            <Link
              to={generateLocalePath(RoutesConfig.home)}
              aria-label={intl.formatMessage({
                id: 'Header / Home link aria label',
                defaultMessage: 'Go back home',
              })}
            >
              <Logo />
            </Link>
          </div>

          <nav className="flex flex-col gap-y-1 -mx-2">
            <RoleAccess>
              <Link
                variant="default"
                className={menuItemClassName}
                to={generateLocalePath(RoutesConfig.home)}
                onClick={closeSidebar}
                navLink
              >
                <FormattedMessage defaultMessage="Dashboard" id="Home / dashboard link" />
              </Link>
            </RoleAccess>

            <RoleAccess>
              <Link
                className={menuItemClassName}
                to={generateLocalePath(RoutesConfig.demoItems)}
                onClick={closeSidebar}
                navLink
              >
                <FormattedMessage defaultMessage="Demo Contentful items" id="Home / demo contentful items link" />
              </Link>
            </RoleAccess>

            <RoleAccess>
              <Link
                className={menuItemClassName}
                to={generateLocalePath(RoutesConfig.crudDemoItem.list)}
                onClick={closeSidebar}
                navLink
              >
                <FormattedMessage defaultMessage="CRUD Example Items" id="Home / CRUD example items link" />
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

            <RoleAccess>
              <Link
                className={menuItemClassName}
                to={generateLocalePath(RoutesConfig.finances.paymentConfirm)}
                onClick={closeSidebar}
                navLink
              >
                <FormattedMessage defaultMessage="Payment demo" id="Home / payment demo link" />
              </Link>
            </RoleAccess>

            <RoleAccess>
              <Link
                className={menuItemClassName}
                to={generateLocalePath(RoutesConfig.subscriptions.index)}
                onClick={closeSidebar}
                navLink
              >
                <FormattedMessage defaultMessage="My Subscription" id="Home / my subscriptions link" />
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
                to={generateLocalePath(RoutesConfig.saasIdeas)}
                onClick={closeSidebar}
                navLink
              >
                <FormattedMessage defaultMessage="Generate SaaS ideas" id="Home / saas ideas link" />
              </Link>
            </RoleAccess>

            {!isDesktop && (
              <RoleAccess>
                <Link
                  className={menuItemClassName}
                  to={generateLocalePath(RoutesConfig.logout)}
                  onClick={closeSidebar}
                  navLink
                >
                  <FormattedMessage defaultMessage="Logout" id="Home / logout link" />
                </Link>
              </RoleAccess>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};
