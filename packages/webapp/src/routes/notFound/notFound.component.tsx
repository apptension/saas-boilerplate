import { typography } from '@saas-boilerplate-app/webapp-core/theme';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

import { Container } from './notFound.styles';

export const NotFound = () => {
  const intl = useIntl();

  return (
    <Container>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Not found',
          id: 'Not found / page title',
        })}
      />

      <typography.H1>
        <FormattedMessage defaultMessage="Error: 404" id="Not found / error message" />
      </typography.H1>
    </Container>
  );
};
