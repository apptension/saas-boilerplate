import { StoryFn } from '@storybook/react';

import { LanguageSwitcher } from '.';
import { withProviders } from '../../utils/storybook';

const Template: StoryFn = () => <LanguageSwitcher />;

export default {
  title: 'Shared/LanguageSwitcher',
  decorators: [withProviders()],
};

export const Default = {
  render: Template,
  args: {},
};
