import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { ROUTES } from '../app.constants';
import { LanguageSwitcher } from '../../shared/components/languageSwitcher';
import { H1 } from '../../theme/typography';
import { useLocale } from '../useLanguageFromParams/useLanguageFromParams.hook';
import { RoleAccess } from '../../shared/components/roleAccess';
import { Role } from '../../modules/auth/auth.types';
import { Link } from '../../shared/components/link';
import { Container, Logo } from './home.styles';

export const Home = () => {
  const intl = useIntl();
  const locale = useLocale();

  return (
    <Container>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Homepage',
          description: 'Home / page title',
        })}
      />

      <H1>
        <FormattedMessage defaultMessage="Hello world!" description="Home / title" />
      </H1>

      <Logo />

      <LanguageSwitcher />

      <Link to={`/${locale}${ROUTES.login}`}>
        <FormattedMessage defaultMessage="Login" description="Home / login link" />
      </Link>

      <Link to={`/${locale}${ROUTES.signup}`}>
        <FormattedMessage defaultMessage="Signup" description="Home / signup link" />
      </Link>

      <Link to={`/${locale}${ROUTES.profile}`}>
        <FormattedMessage defaultMessage="Profile" description="Home / profile link" />
      </Link>

      <Link to={`/${locale}${ROUTES.passwordReset.index}`}>
        <FormattedMessage defaultMessage="Reset password" description="Home / reset password link" />
      </Link>

      <Link to={`/${locale}${ROUTES.privacyPolicy}`}>
        <FormattedMessage defaultMessage="Privacy policy" description="Home / privacy policy link" />
      </Link>

      <Link to={`/${locale}${ROUTES.termsAndConditions}`}>
        <FormattedMessage defaultMessage="Terms and conditions" description="Home / t&c link" />
      </Link>

      <Link to={`/${locale}${ROUTES.demoItems}`}>
        <FormattedMessage defaultMessage="Demo Contentful items" description="Home / demo contentful items link" />
      </Link>

      <Link to={`/${locale}${ROUTES.crudDemoItem.list}`}>
        <FormattedMessage defaultMessage="CRUD Example Items" description="Home / CRUD example items link" />
      </Link>

      <RoleAccess allowedRoles={Role.ADMIN}>
        <Link to={`/${locale}${ROUTES.admin}`}>
          <FormattedMessage defaultMessage="Admin" description="Home / admin link" />
        </Link>
      </RoleAccess>
    </Container>
  );
};
