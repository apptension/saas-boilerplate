import React, { HTMLAttributes, useContext, useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ClickAwayListener from 'react-click-away-listener';
import { selectIsLoggedIn } from '../../../modules/auth/auth.selectors';
import { useGenerateLocalePath } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../../routes/app.constants';
import { logout } from '../../../modules/auth/auth.actions';
import { Button } from '../button';
import { Link as ButtonLink } from '../link';
import { ButtonVariant } from '../button/button.types';
import { Snackbar } from '../snackbar';
import { LayoutContext } from '../../../routes/layout/layout.context';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Breakpoint } from '../../../theme/media';
import {
  Avatar,
  Container,
  Content,
  GlobalActions,
  HeaderLogo,
  Menu,
  MenuLine,
  MenuToggleButton,
  ProfileActions,
  SnackbarMessages,
} from './header.styles';

export const Header = (props: HTMLAttributes<HTMLHeadElement>) => {
  const intl = useIntl();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const generateLocalePath = useGenerateLocalePath();
  const dispatch = useDispatch();
  const { matches: isDesktop } = useMediaQuery({ above: Breakpoint.TABLET });
  const { setSideMenuOpen, isSideMenuOpen, isSidebarAvailable } = useContext(LayoutContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const closeDropdown = () => setDropdownOpen(false);
  const handleLogout = () => {
    closeDropdown();
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

        <GlobalActions>
          <Link
            to={generateLocalePath(ROUTES.home)}
            aria-label={intl.formatMessage({
              description: 'Header / Home link aria label',
              defaultMessage: 'Go back home',
            })}
          >
            <HeaderLogo />
          </Link>
        </GlobalActions>

        <SnackbarMessages>
          <Snackbar />
        </SnackbarMessages>

        {isLoggedIn && (
          <ProfileActions>
            <Avatar
              onClick={() => setDropdownOpen((isOpen) => !isOpen)}
              tabIndex={0}
              aria-expanded={isDropdownOpen}
              aria-label={intl.formatMessage({
                description: 'Header / Open profile menu aria label',
                defaultMessage: 'Open profile menu',
              })}
            />

            <ClickAwayListener onClickAway={isDropdownOpen ? closeDropdown : () => null}>
              <Menu isOpen={isDropdownOpen}>
                <ButtonLink
                  onClick={closeDropdown}
                  to={generateLocalePath(ROUTES.profile)}
                  variant={ButtonVariant.FLAT}
                >
                  <FormattedMessage defaultMessage={'Profile'} description={'Header / Profile button'} />
                </ButtonLink>
                <Button onClick={handleLogout} variant={ButtonVariant.FLAT}>
                  <FormattedMessage defaultMessage={'Log out'} description={'Header / Logout button'} />
                </Button>
              </Menu>
            </ClickAwayListener>
          </ProfileActions>
        )}
      </Content>
    </Container>
  );
};
