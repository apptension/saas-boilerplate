import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../utils/testUtils';
import { prepareState } from '../../../mocks/store';
import { loggedInAuthFactory } from '../../../mocks/factories';
import { Header } from './header.component';

const store = prepareState((state) => {
  state.auth = loggedInAuthFactory();
});

const Template: Story = (args) => {
  return (
    <ProvidersWrapper context={{ store }}>
      <Header {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Header',
  component: Header,
};

export const Default = Template.bind({});
