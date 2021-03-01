import React from 'react';
import { Story } from '@storybook/react';
import styled from 'styled-components';
import { elevationLight, elevationLightest, elevationMedium, elevationStrong, elevationStrongest } from '../elevation';

const Box = styled.div`
  margin: 20px;
  width: 80px;
  height: 80px;
  background-color: white;
  border-radius: 4px;
`;

const BoxLightest = styled(Box)`
  ${elevationLightest}
`;

const BoxLight = styled(Box)`
  ${elevationLight}
`;

const BoxMedium = styled(Box)`
  ${elevationMedium}
`;

const BoxStrong = styled(Box)`
  ${elevationStrong}
`;

const BoxStronest = styled(Box)`
  ${elevationStrongest}
`;

const Template: Story = () => (
  <>
    <BoxLightest />
    <BoxLight />
    <BoxMedium />
    <BoxStrong />
    <BoxStronest />
  </>
);

export default {
  title: 'Styleguide/Elevation',
  component: Box,
};

export const Elevation = Template.bind({});
