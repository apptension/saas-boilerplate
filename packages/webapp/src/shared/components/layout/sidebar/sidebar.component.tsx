import { HTMLAttributes, useCallback, useContext, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import closeIcon from '@iconify-icons/ion/close-outline';
import { RoutesConfig } from '../../../../app/config/routes';
import { RoleAccess } from '../../roleAccess';
import { Role } from '../../../../modules/auth/auth.types';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { Breakpoint } from '../../../../theme/media';
import { Icon } from '../../icon';
import { Link } from '../../link';
import { Avatar } from '../../avatar';
import { LayoutContext } from '../layout.context';
import { NO_SCROLL_CLASSNAME } from '../../../../theme/global';
import { useGenerateLocalePath } from '../../../hooks/localePaths';
import { useAuth } from '../../../hooks/useAuth/useAuth';
import { CloseButton, Container, Header, MenuLink, MenuLinks } from './sidebar.styles';

export const Sidebar = (props: HTMLAttributes<HTMLDivElement>) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const { setSideMenuOpen, isSideMenuOpen } = useContext(LayoutContext);
  const { matches: isDesktop } = useMediaQuery({ above: Breakpoint.TABLET });

  const closeSidebar = useCallback(() => setSideMenuOpen(false), [setSideMenuOpen]);

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isDesktop && isSideMenuOpen) {
      document.body.classList.add(NO_SCROLL_CLASSNAME);
    } else {
      document.body.classList.remove(NO_SCROLL_CLASSNAME);
    }

    return () => {
      document.body.classList.remove(NO_SCROLL_CLASSNAME);
    };
  }, [isDesktop, isSideMenuOpen]);

  return (
    <Container {...props} isOpen={isSideMenuOpen}>
      <Header>
        {isLoggedIn && (
          <Link
            to={generateLocalePath(RoutesConfig.profile)}
            onClick={closeSidebar}
            aria-label={intl.formatMessage({
              defaultMessage: 'Open profile',
              id: 'Home / open profile avatar label',
            })}
          >
            <Avatar />
          </Link>
        )}
        <CloseButton
          onClick={closeSidebar}
          aria-label={intl.formatMessage({
            defaultMessage: 'Close menu',
            id: 'Home / close sidebar icon label',
          })}
        >
          <Icon icon={closeIcon} />
        </CloseButton>
      </Header>

      <MenuLinks>
        <RoleAccess>
          <MenuLink to={generateLocalePath(RoutesConfig.home)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="Dashboard" id="Home / dashboard link" />
          </MenuLink>
        </RoleAccess>

        <RoleAccess>
          <MenuLink to={generateLocalePath(RoutesConfig.demoItems)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="Demo Contentful items" id="Home / demo contentful items link" />
          </MenuLink>
        </RoleAccess>

        <RoleAccess>
          <MenuLink to={generateLocalePath(RoutesConfig.crudDemoItem.list)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="CRUD Example Items" id="Home / CRUD example items link" />
          </MenuLink>
        </RoleAccess>

        <RoleAccess allowedRoles={Role.ADMIN}>
          <MenuLink to={generateLocalePath(RoutesConfig.admin)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="Admin" id="Home / admin link" />
          </MenuLink>
        </RoleAccess>

        <MenuLink to={generateLocalePath(RoutesConfig.privacyPolicy)} onClick={closeSidebar}>
          <FormattedMessage defaultMessage="Privacy policy" id="Home / privacy policy link" />
        </MenuLink>

        <MenuLink to={generateLocalePath(RoutesConfig.termsAndConditions)} onClick={closeSidebar}>
          <FormattedMessage defaultMessage="Terms and conditions" id="Home / t&c link" />
        </MenuLink>

        <RoleAccess>
          <MenuLink to={generateLocalePath(RoutesConfig.finances.paymentConfirm)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="Payment demo" id="Home / payment demo link" />
          </MenuLink>
        </RoleAccess>

        <RoleAccess>
          <MenuLink to={generateLocalePath(RoutesConfig.subscriptions.index)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="My Subscription" id="Home / my subscriptions link" />
          </MenuLink>
        </RoleAccess>

        <RoleAccess>
          <MenuLink to={generateLocalePath(RoutesConfig.documents)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="Documents" id="Home / documents link" />
          </MenuLink>
        </RoleAccess>

        {!isDesktop && (
          <RoleAccess>
            <MenuLink to={generateLocalePath(RoutesConfig.logout)} onClick={closeSidebar}>
              <FormattedMessage defaultMessage="Logout" id="Home / logout link" />
            </MenuLink>
          </RoleAccess>
        )}
      </MenuLinks>
    </Container>
  );
};
