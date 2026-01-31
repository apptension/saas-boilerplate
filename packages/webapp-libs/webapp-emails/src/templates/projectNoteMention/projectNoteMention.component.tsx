import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout, Text } from '../../base';
import { CommentContent } from '../../components/commentContent/commentContent.component';
import { EmailComponentProps } from '../../types';

export type ProjectNoteMentionProps = EmailComponentProps & {
  projectName: string;
  authorName: string;
  noteContent: string;
  projectUrl: string;
};

export const Template = ({
  projectName,
  authorName,
  noteContent,
  projectUrl,
}: ProjectNoteMentionProps) => {
  const intl = useIntl();

  const preheaderText = intl.formatMessage({
    defaultMessage: 'You were mentioned in project notes',
    id: 'Email / ProjectNoteMention / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage
          defaultMessage="You Were Mentioned in Project Notes"
          id="Email / ProjectNoteMention / Title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="{authorName} mentioned you in the notes for a project."
          id="Email / ProjectNoteMention / Text"
          values={{ authorName }}
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Project:" id="Email / ProjectNoteMention / Project" />
        </strong>{' '}
        {projectName}
      </Text>
      <CommentContent content={noteContent} />
      <Button linkTo={projectUrl}>
        <FormattedMessage defaultMessage="View Project" id="Email / ProjectNoteMention / ViewProject" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage
    defaultMessage="You Were Mentioned in Project Notes"
    id="Email / ProjectNoteMention / Subject"
  />
);
