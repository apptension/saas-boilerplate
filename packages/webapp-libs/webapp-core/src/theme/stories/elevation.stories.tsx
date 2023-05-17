import { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';

import { light, lightest, medium, strong, strongest } from '../elevation';

const Box = styled.div`
  margin: 20px;
  width: 80px;
  height: 80px;
  background-color: white;
  border-radius: 4px;
`;

const BoxLightest = styled(Box)`
  ${lightest}
`;

const BoxLight = styled(Box)`
  ${light}
`;

const BoxMedium = styled(Box)`
  ${medium}
`;

const BoxStrong = styled(Box)`
  ${strong}
`;

const BoxStrongest = styled(Box)`
  ${strongest}
`;

type Story = StoryObj<typeof Box>;

const meta: Meta<typeof Box> = {
  title: 'Styleguide/Elevation',
  component: Box,
};

export default meta;

export const Elevation: Story = {
  render: () => (
    <>
      <BoxLightest />
      <BoxLight />
      <BoxMedium />
      <BoxStrong />
      <BoxStrongest />
    </>
  ),
};
