import { FormattedMessage, useIntl } from 'react-intl';
import { ROUTES } from '../../../routes/app.constants';
import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';
import { useGenerateLocalePath } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';
import { Date } from '../../../shared/components/date';

export type TrialExpiresSoonProps = EmailComponentProps & {
  expiryDate: string;
};

export const Template = ({ expiryDate }: TrialExpiresSoonProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const url = generateLocalePath(ROUTES.home, {}, { absolute: true });

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
          values={{ expiryDate: <Date value={expiryDate} /> }}
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
