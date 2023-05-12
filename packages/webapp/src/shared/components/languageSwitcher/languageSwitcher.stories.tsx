import { StoryFn } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { LanguageSwitcher } from '.';

const Template: StoryFn = () => <LanguageSwitcher />;

export default {
  title: 'Shared/LanguageSwitcher',
  decorators: [withProviders()],
};

export const Default = {
  render: Template,
  args: {},
};
