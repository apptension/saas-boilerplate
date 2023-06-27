import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { SaasIdeas } from './saasIdeas.component';

const Template: StoryFn = () => {
  return <SaasIdeas />;
};

const meta: Meta = {
  title: 'Routes / SaasIdeas',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  decorators: [withProviders({})],
};
