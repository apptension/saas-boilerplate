import { H3 } from '@sb/webapp-core/components/typography';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

export const NotFound = () => {
  const intl = useIntl();

  return (
    <div className="mx-auto flex w-full  justify-center ">
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Not found',
          id: 'Not found / page title',
        })}
      />

      <H3>
        <FormattedMessage defaultMessage="Error: 404" id="Not found / error message" />
      </H3>
    </div>
  );
};
