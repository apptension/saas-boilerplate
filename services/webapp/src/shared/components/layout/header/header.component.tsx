import { HTMLAttributes, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ClickAwayListener from 'react-click-away-listener';
import { selectIsLoggedIn } from '../../../../modules/auth/auth.selectors';
import { RoutesConfig } from '../../../../app/config/routes';
import { logout } from '../../../../modules/auth/auth.actions';
import { Button, ButtonVariant } from '../../forms/button';
import { Link as ButtonLink } from '../../link';
import { Snackbar } from '../../snackbar';
import { LayoutContext } from '../layout.context';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { Breakpoint } from '../../../../theme/media';
import { useOpenState } from '../../../hooks/useOpenState';
import { Notifications } from '../../notifications';
import { useGenerateLocalePath } from '../../../hooks/localePaths';
import {
  Avatar,
  Container,
  Content,
  MenuContainer,
  HeaderLogo,
  Menu,
  MenuLine,
  MenuToggleButton,
  ProfileActions,
  SnackbarMessages,
} from './header.styles';

export type HeaderProps = HTMLAttributes<HTMLElement>;

export const Header = (props: HeaderProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const generateLocalePath = useGenerateLocalePath();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const { setSideMenuOpen, isSideMenuOpen, isSidebarAvailable } = useContext(LayoutContext);
  const { matches: isDesktop } = useMediaQuery({ above: Breakpoint.TABLET });
  const userDropdown = useOpenState(false);

  const handleLogout = () => {
    userDropdown.close();
    dispatch(logout());
  };

  return (
    <Container {...props}>
      <Content>
        {isSidebarAvailable && !isDesktop && (
          <MenuToggleButton
            onClick={() => setSideMenuOpen(true)}
            aria-expanded={isSideMenuOpen}
            aria-label={intl.formatMessage({
              description: 'Header / Home menu link aria label',
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
              description: 'Header / Home link aria label',
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
                  description: 'Header / Open profile menu aria label',
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
                    <FormattedMessage defaultMessage="Profile" description="Header / Profile button" />
                  </ButtonLink>
                  <Button onClick={handleLogout} variant={ButtonVariant.FLAT}>
                    <FormattedMessage defaultMessage="Log out" description="Header / Logout button" />
                  </Button>
                </Menu>
              </ClickAwayListener>
            </ProfileActions>
          </>
        )}
      </Content>
    </Container>
  );
};
