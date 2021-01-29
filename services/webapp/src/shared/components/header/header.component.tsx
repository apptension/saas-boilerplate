import React from 'react';

import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectIsLoggedIn, selectProfileEmail } from '../../../modules/auth/auth.selectors';
import { useLocaleUrl } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../../routes/app.constants';
import { renderWhenTrue } from '../../utils/rendering';
import { Container } from './header.styles';

export const Header = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const email = useSelector(selectProfileEmail);
  const profileUrl = useLocaleUrl(ROUTES.profile);

  return (
    <Container>
      {renderWhenTrue(() => (
        <Link to={profileUrl}>
          <FormattedMessage
            defaultMessage={'My profile ({email})'}
            values={{ email }}
            description={'Header / Profile button'}
          />
        </Link>
      ))(isLoggedIn)}
    </Container>
  );
};
