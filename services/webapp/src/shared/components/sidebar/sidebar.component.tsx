import React, { HTMLAttributes, useCallback, useContext, useEffect } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import closeIcon from '@iconify-icons/ion/close-outline';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../../../routes/app.constants';
import { RoleAccess } from '../roleAccess';
import { Role } from '../../../modules/auth/auth.types';
import { useGenerateLocalePath } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Breakpoint } from '../../../theme/media';
import { Icon } from '../icon';
import { Link } from '../link';
import { Avatar } from '../avatar';
import { LayoutContext } from '../../../routes/layout/layout.context';
import { NO_SCROLL_CLASSNAME } from '../../../theme/global';
import { Button } from '../button';
import { logout } from '../../../modules/auth/auth.actions';
import { selectIsLoggedIn } from '../../../modules/auth/auth.selectors';
import { CloseButton, Container, Header, MenuLink, MenuLinks } from './sidebar.styles';

export const Sidebar = (props: HTMLAttributes<HTMLDivElement>) => {
  const intl = useIntl();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const generateLocalePath = useGenerateLocalePath();
  const { setSideMenuOpen, isSideMenuOpen } = useContext(LayoutContext);
  const { matches: isDesktop } = useMediaQuery({ above: Breakpoint.TABLET });

  const closeSidebar = useCallback(() => setSideMenuOpen(false), [setSideMenuOpen]);

  const handleLogout = useCallback(() => {
    closeSidebar();
    dispatch(logout());
  }, [closeSidebar, dispatch]);

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
            to={generateLocalePath(ROUTES.profile)}
            onClick={closeSidebar}
            aria-label={intl.formatMessage({
              defaultMessage: 'Open profile',
              description: 'Home / open profile avatar label',
            })}
          >
            <Avatar />
          </Link>
        )}
        <CloseButton
          onClick={closeSidebar}
          aria-label={intl.formatMessage({
            defaultMessage: 'Close menu',
            description: 'Home / close sidebar icon label',
          })}
        >
          <Icon icon={closeIcon} />
        </CloseButton>
      </Header>

      <MenuLinks>
        <RoleAccess>
          <MenuLink to={generateLocalePath(ROUTES.home)} onClick={closeSidebar} exact={true}>
            <FormattedMessage defaultMessage="Dashboard" description="Home / dashboard link" />
          </MenuLink>
        </RoleAccess>

        <RoleAccess>
          <MenuLink to={generateLocalePath(ROUTES.demoItems)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="Demo Contentful items" description="Home / demo contentful items link" />
          </MenuLink>
        </RoleAccess>

        <RoleAccess>
          <MenuLink to={generateLocalePath(ROUTES.crudDemoItem.list)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="CRUD Example Items" description="Home / CRUD example items link" />
          </MenuLink>
        </RoleAccess>

        <RoleAccess allowedRoles={Role.ADMIN}>
          <MenuLink to={generateLocalePath(ROUTES.admin)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="Admin" description="Home / admin link" />
          </MenuLink>
        </RoleAccess>

        <MenuLink to={generateLocalePath(ROUTES.privacyPolicy)} onClick={closeSidebar}>
          <FormattedMessage defaultMessage="Privacy policy" description="Home / privacy policy link" />
        </MenuLink>

        <MenuLink to={generateLocalePath(ROUTES.termsAndConditions)} onClick={closeSidebar}>
          <FormattedMessage defaultMessage="Terms and conditions" description="Home / t&c link" />
        </MenuLink>

        <RoleAccess>
          <MenuLink to={generateLocalePath(ROUTES.finances.paymentConfirm)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="Payment demo" description="Home / payment demo link" />
          </MenuLink>
        </RoleAccess>

        <RoleAccess>
          <MenuLink to={generateLocalePath(ROUTES.subscriptions.index)} onClick={closeSidebar}>
            <FormattedMessage defaultMessage="My Subscription" description="Home / my subscriptions link" />
          </MenuLink>
        </RoleAccess>

        {!isDesktop && (
          <RoleAccess>
            <MenuLink as={Button} onClick={handleLogout}>
              <FormattedMessage defaultMessage="Logout" description="Home / logout link" />
            </MenuLink>
          </RoleAccess>
        )}
      </MenuLinks>
    </Container>
  );
};