import { typography } from '@sb/webapp-core/theme';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

import { Container } from './home.styles';

export const Home = () => {
  const intl = useIntl();

  return (
    <Container>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Homepage',
          id: 'Home / page title',
        })}
      />

      <typography.H1>
        <FormattedMessage defaultMessage="Welcome!" id="Home / title" />
      </typography.H1>
    </Container>
  );
};
