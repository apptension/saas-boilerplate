import { BackButton } from '../backButton';
import { Container, Markdown } from './markdownPage.styles';

export type MarkdownPageProps = {
  markdown?: string | null;
};

export const MarkdownPage = ({ markdown }: MarkdownPageProps) => {
  return (
    <Container>
      <BackButton />
      <Markdown>{markdown ?? ''}</Markdown>
    </Container>
  );
};
