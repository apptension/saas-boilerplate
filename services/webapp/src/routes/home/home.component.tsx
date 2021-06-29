import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { H1 } from '../../theme/typography';
import { Container } from './home.styles';

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
        <FormattedMessage defaultMessage="Welcome in the app!" description="Home / title" />
      </H1>
    </Container>
  );
};
