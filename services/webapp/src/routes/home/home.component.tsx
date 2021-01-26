import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

import { LanguageSwitcher } from '../../shared/components/languageSwitcher';
import { H1 } from '../../theme/typography';
import { Users } from '../../shared/components/users';
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

      <Users />
    </Container>
  );
};
