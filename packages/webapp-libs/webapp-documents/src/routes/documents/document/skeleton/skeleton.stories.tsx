import { Meta, StoryFn, StoryObj } from '@storybook/react';
import styled from 'styled-components';

import { withProviders } from '../../../../utils/storybook';
import { Skeleton } from './skeleton.component';

const Container = styled.div`
  width: 200px;
  padding: 10px;
`;

const Template: StoryFn = () => {
  return (
    <Container>
      <Skeleton />
    </Container>
  );
};

const meta: Meta = {
  title: 'Routes/Documents/Document/Skeleton',
  component: Skeleton,
  decorators: [withProviders()],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
};
