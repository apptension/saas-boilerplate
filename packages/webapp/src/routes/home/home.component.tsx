import { typography } from '@sb/webapp-core/theme';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

export const Home = () => {
  const intl = useIntl();

  return (
    <div className="px-8">
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Homepage',
          id: 'Home / page title',
        })}
      />

      <typography.H1>
        <FormattedMessage defaultMessage="Welcome!" id="Home / title" />
      </typography.H1>
    </div>
  );
};
