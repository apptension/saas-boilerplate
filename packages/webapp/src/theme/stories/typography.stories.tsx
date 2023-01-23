import { Story } from '@storybook/react';
import styled from 'styled-components';
import { H1, H2, H3, H4, H5, Paragraph, ParagraphBold, Label, MicroLabel, UltraMicroLabel } from '../typography';

const Container = styled.div`
  margin: 20px;
`;

const Template: Story = () => (
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
);

export default {
  title: 'Styleguide/Typography',
  component: Container,
};

export const Primary = Template.bind({});
