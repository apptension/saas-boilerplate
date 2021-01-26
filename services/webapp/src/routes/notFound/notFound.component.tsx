import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

import { H1 } from '../../theme/typography';
import { Container } from './notFound.styles';

export const NotFound = () => {
  const intl = useIntl();

  return (
    <Container>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Not found',
          description: 'Not found / page title',
        })}
      />

      <H1>
        <FormattedMessage defaultMessage="Error: 404" description="Not found / error message" />
      </H1>
    </Container>
  );
};
