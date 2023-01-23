import { Story } from '@storybook/react';
import styled from 'styled-components';
import { Skeleton } from './skeleton.component';

const Container = styled.div`
  width: 200px;
  padding: 10px;
`;

const Template: Story = () => {
  return (
    <Container>
      <Skeleton />
    </Container>
  );
};

export default {
  title: 'Routes/Documents/Document/Skeleton',
  component: Skeleton,
};

export const Default = Template.bind({});
