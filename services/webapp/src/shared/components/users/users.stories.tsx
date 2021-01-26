import React from 'react';
import { Story } from '@storybook/react';
import { times } from 'ramda';

import { withRouter } from '../../../../.storybook/decorators';
import { withRedux } from '../../utils/storybook';
import { userFactory } from '../../../mocks/factories';
import { prepareState } from '../../../mocks/store';
import { Users } from './users.component';

const Template: Story = (args) => <Users {...args} />;

export default {
  title: 'Shared/Users',
  component: Users,
  decorators: [
    withRedux(
      prepareState((state) => {
        state.users.users = times(() => userFactory(), 10);
      })
    ),
    withRouter(),
  ],
};

export const Default = Template.bind({});
Default.args = {};
