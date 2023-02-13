import { Story } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { LanguageSwitcher } from '.';

const Template: Story = () => <LanguageSwitcher />;

export default {
  title: 'Shared/LanguageSwitcher',
  decorators: [withProviders()],
};

export const Default = Template.bind({});
Default.args = {};
