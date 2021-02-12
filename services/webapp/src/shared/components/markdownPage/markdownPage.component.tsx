import React from 'react';
import ReactMarkdown from 'react-markdown';

import { Container } from './markdownPage.styles';

export interface MarkdownPageProps {
  markdown?: string;
}

export const MarkdownPage = ({ markdown = '' }: MarkdownPageProps) => {
  return (
    <Container>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </Container>
  );
};
