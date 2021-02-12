import React from 'react';

import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectIsLoggedIn, selectProfileEmail } from '../../../modules/auth/auth.selectors';
import { useLocaleUrl } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../../routes/app.constants';
import { renderWhenTrue } from '../../utils/rendering';
import { logout } from '../../../modules/auth/auth.actions';
import { Container, LogoutButton, GlobalActions, ProfileActions } from './header.styles';

export const Header = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const email = useSelector(selectProfileEmail);
  const homeUrl = useLocaleUrl(ROUTES.home);
  const profileUrl = useLocaleUrl(ROUTES.profile);
  const dispatch = useDispatch();
  const handleLogout = () => dispatch(logout());

  return (
    <Container>
      <GlobalActions>
        <Link to={homeUrl}>
          <FormattedMessage defaultMessage={'Home'} values={{ email }} description={'Header / Home button'} />
        </Link>
      </GlobalActions>

      {renderWhenTrue(() => (
        <ProfileActions>
          <Link to={profileUrl}>
            <FormattedMessage
              defaultMessage={'My profile ({email})'}
              values={{ email }}
              description={'Header / Profile button'}
            />
          </Link>
          <LogoutButton onClick={handleLogout}>
            <FormattedMessage defaultMessage={'Logout'} description={'Header / Logout button'} />
          </LogoutButton>
        </ProfileActions>
      ))(isLoggedIn)}
    </Container>
  );
};
