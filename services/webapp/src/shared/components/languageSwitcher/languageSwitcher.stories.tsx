import React from 'react';
import { Story } from '@storybook/react';

import { withRouter } from '../../../../.storybook/decorators';

import { store } from '../../../mocks/store';
import { withRedux } from '../../utils/storybook';
import { LanguageSwitcher } from '.';

const Template: Story = (args) => <LanguageSwitcher {...args} />;

export default {
  title: 'Shared/LanguageSwitcher',
  decorators: [withRedux(store), withRouter()],
};

export const Default = Template.bind({});
Default.args = {};
