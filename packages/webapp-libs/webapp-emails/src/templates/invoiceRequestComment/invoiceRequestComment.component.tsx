import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout, Text } from '../../base';
import { CommentContent } from '../../components/commentContent/commentContent.component';
import { EmailComponentProps } from '../../types';

export type InvoiceRequestCommentProps = EmailComponentProps & {
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
}: InvoiceRequestCommentProps) => {
  const intl = useIntl();

  const preheaderText = intl.formatMessage({
    defaultMessage: 'New comment on invoice request',
    id: 'Email / InvoiceRequestComment / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage
          defaultMessage="New Comment on Invoice Request"
          id="Email / InvoiceRequestComment / Title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="{commenterName} added a comment to an invoice request."
          id="Email / InvoiceRequestComment / Text"
          values={{ commenterName }}
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Project:" id="Email / InvoiceRequestComment / Project" />
        </strong>{' '}
        {projectName}
      </Text>
      {iterationName && (
        <Text>
          <strong>
            <FormattedMessage defaultMessage="Iteration:" id="Email / InvoiceRequestComment / Iteration" />
          </strong>{' '}
          {iterationName}
        </Text>
      )}
      <CommentContent content={commentContent} />
      <Button linkTo={requestUrl}>
        <FormattedMessage defaultMessage="View Request" id="Email / InvoiceRequestComment / ViewRequest" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage
    defaultMessage="New Comment on Invoice Request"
    id="Email / InvoiceRequestComment / Subject"
  />
);
