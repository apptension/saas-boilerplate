import { Meta, StoryObj } from '@storybook/react';
import { HtmlHTMLAttributes } from 'react';

import { H1, H2, H3, H4, Paragraph, ParagraphBold, Small } from './typography';

const Container = ({ children }: HtmlHTMLAttributes<HTMLDivElement>) => (
  <div className="flex flex-col gap-4">{children}</div>
);

const meta: Meta<typeof Container> = {
  title: 'Core/Typography',
  component: Container,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Container>
      <H1>Heading 1</H1>
      <H2>Heading 1</H2>
      <H3>Heading 1</H3>
      <H4>Heading 1</H4>
      <Paragraph>Paragraph</Paragraph>
      <ParagraphBold>Paragraph bold</ParagraphBold>
      <Small>Small</Small>
    </Container>
  ),
};
