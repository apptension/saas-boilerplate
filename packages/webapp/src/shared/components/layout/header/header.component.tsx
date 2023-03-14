import { Link as ButtonLink, ButtonVariant } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { useMediaQuery } from '@saas-boilerplate-app/webapp-core/hooks';
import { Snackbar } from '@saas-boilerplate-app/webapp-core/snackbar';
import { media } from '@saas-boilerplate-app/webapp-core/theme';
import { HTMLAttributes, useContext } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { useAuth, useGenerateLocalePath, useOpenState } from '../../../hooks';
import { Notifications } from '../../notifications';
import { LayoutContext } from '../layout.context';
import {
  Avatar,
  Container,
  Content,
  HeaderLogo,
  Menu,
  MenuContainer,
  MenuLine,
  MenuToggleButton,
  ProfileActions,
  SnackbarMessages,
} from './header.styles';

export type HeaderProps = HTMLAttributes<HTMLElement>;

export const Header = (props: HeaderProps) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const { setSideMenuOpen, isSideMenuOpen, isSidebarAvailable } = useContext(LayoutContext);
  const { matches: isDesktop } = useMediaQuery({ above: media.Breakpoint.TABLET });
  const userDropdown = useOpenState(false);
  const { isLoggedIn } = useAuth();

  return (
    <Container {...props}>
      <Content>
        {isSidebarAvailable && !isDesktop && (
          <MenuToggleButton
            onClick={() => setSideMenuOpen(true)}
            aria-expanded={isSideMenuOpen}
            aria-label={intl.formatMessage({
              id: 'Header / Home menu link aria label',
              defaultMessage: 'Open menu',
            })}
          >
            <MenuLine />
            <MenuLine />
            <MenuLine />
          </MenuToggleButton>
        )}

        <MenuContainer>
          <Link
            to={generateLocalePath(RoutesConfig.home)}
            aria-label={intl.formatMessage({
              id: 'Header / Home link aria label',
              defaultMessage: 'Go back home',
            })}
          >
            <HeaderLogo />
          </Link>
        </MenuContainer>

        <SnackbarMessages>
          <Snackbar />
        </SnackbarMessages>

        {isLoggedIn && (
          <>
            <Notifications />

            <ProfileActions>
              <Avatar
                onClick={userDropdown.toggle}
                tabIndex={0}
                aria-expanded={userDropdown.isOpen}
                aria-label={intl.formatMessage({
                  id: 'Header / Open profile menu aria label',
                  defaultMessage: 'Open profile menu',
                })}
              />

              <ClickAwayListener onClickAway={userDropdown.clickAway}>
                <Menu isOpen={userDropdown.isOpen}>
                  <ButtonLink
                    onClick={userDropdown.close}
                    to={generateLocalePath(RoutesConfig.profile)}
                    variant={ButtonVariant.FLAT}
                  >
                    <FormattedMessage defaultMessage="Profile" id="Header / Profile button" />
                  </ButtonLink>
                  <ButtonLink
                    onClick={userDropdown.close}
                    to={generateLocalePath(RoutesConfig.logout)}
                    variant={ButtonVariant.FLAT}
                  >
                    <FormattedMessage defaultMessage="Log out" id="Header / Logout button" />
                  </ButtonLink>
                </Menu>
              </ClickAwayListener>
            </ProfileActions>
          </>
        )}
      </Content>
    </Container>
  );
};
