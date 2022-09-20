import { HTMLAttributes, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import ClickAwayListener from 'react-click-away-listener';

import { RoutesConfig } from '../../../../app/config/routes';
import { ButtonVariant } from '../../forms/button';
import { Link as ButtonLink } from '../../link';
import { Snackbar } from '../../snackbar';
import { LayoutContext } from '../layout.context';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { Breakpoint } from '../../../../theme/media';
import { useOpenState } from '../../../hooks/useOpenState';
import { Notifications } from '../../notifications';
import { useGenerateLocalePath } from '../../../hooks/localePaths';
import { useAuth } from '../../../hooks/useAuth/useAuth';
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
  const { matches: isDesktop } = useMediaQuery({ above: Breakpoint.TABLET });
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
