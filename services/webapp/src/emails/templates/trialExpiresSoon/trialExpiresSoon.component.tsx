import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { generatePath } from 'react-router-dom';
import { ROUTES } from '../../../routes/app.constants';
import { Layout, Button } from '../../base';
import { EmailComponentProps } from '../../types';

export interface TrialExpiresSoonProps extends EmailComponentProps {
  expiryDate: string;
}

export const Template = ({ expiryDate }: TrialExpiresSoonProps) => {
  const { locale } = useIntl();
  const url = `${process.env.REACT_APP_WEB_APP_URL}/${locale}${generatePath(ROUTES.home)}`;

  return (
    <Layout
      title={
        <FormattedMessage
          defaultMessage="Your trial is about to expire"
          description="Email / Trial Expires Soon / title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="Your trial is about to expire on {expiryDate}, please take action"
          description="Email / Trial Expires Soon / text"
          values={{ expiryDate }}
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Go to the dashboard" description="Email / Trial Expires Soon / link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => {
  const intl = useIntl();
  return (
    <>
      {intl.formatMessage({
        defaultMessage: 'Your trial is about to expire',
        description: 'Email / Trial Expires Soon / subject',
      })}
    </>
  );
};
