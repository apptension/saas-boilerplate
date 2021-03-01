import React, { useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ClickAwayListener from 'react-click-away-listener';
import { selectIsLoggedIn } from '../../../modules/auth/auth.selectors';
import { useLocaleUrl } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../../routes/app.constants';
import { logout } from '../../../modules/auth/auth.actions';
import { Button } from '../button';
import { Link as ButtonLink } from '../link';
import { ButtonVariant } from '../button/button.types';
import { Container, GlobalActions, HeaderLogo, Menu, ProfileActions, Content, Avatar } from './header.styles';

export const Header = () => {
  const intl = useIntl();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const homeUrl = useLocaleUrl(ROUTES.home);
  const profileUrl = useLocaleUrl(ROUTES.profile);
  const dispatch = useDispatch();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const closeDropdown = () => setDropdownOpen(false);
  const handleLogout = () => {
    closeDropdown();
    dispatch(logout());
  };

  return (
    <Container>
      <Content>
        <GlobalActions>
          <Link
            to={homeUrl}
            aria-label={intl.formatMessage({
              description: 'Header / Home link aria label',
              defaultMessage: 'Go back home',
            })}
          >
            <HeaderLogo />
          </Link>
        </GlobalActions>

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
            {isDropdownOpen && (
              <ClickAwayListener onClickAway={closeDropdown}>
                <Menu>
                  <ButtonLink onClick={closeDropdown} to={profileUrl} variant={ButtonVariant.FLAT}>
                    <FormattedMessage defaultMessage={'Profile'} description={'Header / Profile button'} />
                  </ButtonLink>
                  <Button onClick={handleLogout} variant={ButtonVariant.FLAT}>
                    <FormattedMessage defaultMessage={'Log out'} description={'Header / Logout button'} />
                  </Button>
                </Menu>
              </ClickAwayListener>
            )}
          </ProfileActions>
        )}
      </Content>
    </Container>
  );
};
