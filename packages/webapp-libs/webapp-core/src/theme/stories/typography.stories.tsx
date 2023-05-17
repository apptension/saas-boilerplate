import { Meta } from '@storybook/react';
import styled from 'styled-components';

import { H1, H2, H3, H4, H5, Label, MicroLabel, Paragraph, ParagraphBold, UltraMicroLabel } from '../typography';

const Container = styled.div`
  margin: 20px;
`;

const meta: Meta<typeof Container> = {
  title: 'Styleguide/Typography',
  component: Container,
};

export default meta;

export const Primary = {
  render: () => (
    <Container>
      <H1>Heading 1</H1>
      <H2>Heading 2</H2>
      <H3>Heading 3</H3>
      <H4>Heading 4</H4>
      <H5>Heading 5</H5>
      <Paragraph>Paragraph</Paragraph>
      <ParagraphBold>Paragraph Bold</ParagraphBold>
      <div>
        <Label>Label</Label>
      </div>
      <div>
        <MicroLabel>Micro Label</MicroLabel>
      </div>
      <div>
        <UltraMicroLabel>Ultra Micro Label</UltraMicroLabel>
      </div>
    </Container>
  ),
};
