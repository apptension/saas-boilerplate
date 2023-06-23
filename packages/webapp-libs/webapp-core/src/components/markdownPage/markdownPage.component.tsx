import ReactMarkdown from 'react-markdown';

import { PageLayout } from '../pageLayout';

export type MarkdownPageProps = {
  markdown?: string | null;
};

export const MarkdownPage = ({ markdown }: MarkdownPageProps) => {
  return (
    <PageLayout>
      <ReactMarkdown className="prose dark:prose-invert">{markdown ?? ''}</ReactMarkdown>
    </PageLayout>
  );
};
