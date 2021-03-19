import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { generatePath } from 'react-router-dom';
import { ROUTES } from '../../../routes/app.constants';
import { Layout, Button } from '../../base';

export const Template = () => {
  const url = `${process.env.REACT_APP_WEB_APP_URL}/en${generatePath(ROUTES.subscriptions.index)}`;

  return (
    <Layout
      title={
        <FormattedMessage
          defaultMessage="Your subscription payment failed"
          description="Email / Subscription Error / title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="Click the button below to review your payment method details"
          description="Email / Subscription Error / text"
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage
          defaultMessage="See subscription details"
          description="Email / Subscription Error / link label"
        />
      </Button>
    </Layout>
  );
};

export const Subject = () => {
  const intl = useIntl();
  return (
    <>
      {intl.formatMessage({
        defaultMessage: 'Subscription payment failed',
        description: 'Email / Subscription Error / subject',
      })}
    </>
  );
};
