import { FormattedMessage } from 'react-intl';
import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';
import { FormattedDate } from '../../../shared/components/dateTime/formattedDate';
import { useGenerateAbsoluteLocalePath } from '../../../shared/hooks/localePaths';

export type TrialExpiresSoonProps = EmailComponentProps & {
  expiryDate: string;
};

export const Template = ({ expiryDate }: TrialExpiresSoonProps) => {
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(['home']);

  return (
    <Layout
      title={
        <FormattedMessage defaultMessage="Your trial is about to expire" id="Email / Trial Expires Soon / Title" />
      }
      text={
        <FormattedMessage
          defaultMessage="Your trial is about to expire on {expiryDate}, please take action"
          id="Email / Trial Expires Soon / Text"
          values={{ expiryDate: <FormattedDate value={expiryDate} /> }}
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Go to the dashboard" id="Email / Trial Expires Soon / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Your trial is about to expire" id="Email / Trial Expires Soon / Subject" />
);
