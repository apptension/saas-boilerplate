import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

export const Home = () => {
  const intl = useIntl();

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Homepage',
          id: 'Home / page title',
        })}
      />

      <PageHeadline
        header={<FormattedMessage defaultMessage="Welcome!" id="Home / header" />}
        subheader={<FormattedMessage defaultMessage="This is the dashboard page" id="Home / subheader" />}
      />
    </PageLayout>
  );
};
