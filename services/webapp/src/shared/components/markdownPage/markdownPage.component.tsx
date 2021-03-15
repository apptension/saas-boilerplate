import React from 'react';

import { BackButton } from '../backButton/backButton.component';
import { Container, Markdown } from './markdownPage.styles';

export interface MarkdownPageProps {
  markdown?: string;
}

export const MarkdownPage = ({ markdown = '' }: MarkdownPageProps) => {
  return (
    <Container>
      <BackButton />
      <Markdown>{markdown}</Markdown>
    </Container>
  );
};
