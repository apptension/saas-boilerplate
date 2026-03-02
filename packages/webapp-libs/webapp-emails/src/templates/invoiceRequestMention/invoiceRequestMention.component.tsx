import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout, Text } from '../../base';
import { CommentContent } from '../../components/commentContent/commentContent.component';
import { EmailComponentProps } from '../../types';

export type InvoiceRequestMentionProps = EmailComponentProps & {
  projectName: string;
  iterationName: string;
  commenterName: string;
  commentContent: string;
  requestUrl: string;
};

export const Template = ({
  projectName,
  iterationName,
  commenterName,
  commentContent,
  requestUrl,
}: InvoiceRequestMentionProps) => {
  const intl = useIntl();

  const preheaderText = intl.formatMessage({
    defaultMessage: 'You were mentioned in a comment on an invoice request',
    id: 'Email / InvoiceRequestMention / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage
          defaultMessage="You Were Mentioned in a Comment"
          id="Email / InvoiceRequestMention / Title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="{commenterName} mentioned you in a comment on an invoice request."
          id="Email / InvoiceRequestMention / Text"
          values={{ commenterName }}
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Project:" id="Email / InvoiceRequestMention / Project" />
        </strong>{' '}
        {projectName}
      </Text>
      {iterationName && (
        <Text>
          <strong>
            <FormattedMessage defaultMessage="Iteration:" id="Email / InvoiceRequestMention / Iteration" />
          </strong>{' '}
          {iterationName}
        </Text>
      )}
      <CommentContent content={commentContent} />
      <Button linkTo={requestUrl}>
        <FormattedMessage defaultMessage="View Request" id="Email / InvoiceRequestMention / ViewRequest" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage
    defaultMessage="You Were Mentioned in an Invoice Request Comment"
    id="Email / InvoiceRequestMention / Subject"
  />
);
