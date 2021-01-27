import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

import { LanguageSwitcher } from '../../shared/components/languageSwitcher';
import { H1, H2 } from '../../theme/typography';
import { LoginForm } from '../../shared/components/auth/loginForm';
import { SignupForm } from '../../shared/components/auth/signupForm';
import { Container, Logo } from './home.styles';

export const Home = () => {
  const intl = useIntl();

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

      <H2>
        <FormattedMessage defaultMessage="Register" description="Home / register" />
      </H2>
      <SignupForm />

      <H2>
        <FormattedMessage defaultMessage="Login" description="Home / login" />
      </H2>
      <LoginForm />
    </Container>
  );
};
