import { FormattedMessage } from 'react-intl';
import { ROUTES } from '../../../routes/app.constants';
import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';
import { useGenerateAbsoluteLocalePath } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';
import { Date } from '../../../shared/components/date';

export type TrialExpiresSoonProps = EmailComponentProps & {
  expiryDate: string;
};

export const Template = ({ expiryDate }: TrialExpiresSoonProps) => {
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(ROUTES.home);

  return (
    <Layout
      title={
        <FormattedMessage
          defaultMessage="Your trial is about to expire"
          description="Email / Trial Expires Soon / Title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="Your trial is about to expire on {expiryDate}, please take action"
          description="Email / Trial Expires Soon / Text"
          values={{ expiryDate: <Date value={expiryDate} /> }}
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Go to the dashboard" description="Email / Trial Expires Soon / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Your trial is about to expire" description="Email / Trial Expires Soon / Subject" />
);
