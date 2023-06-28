import { StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { AddCrudDemoItem } from './addCrudDemoItem.component';

const Template: StoryFn = () => {
  return <AddCrudDemoItem />;
};

export default {
  title: 'Crud Demo Item / AddCrudDemoItem',
  component: AddCrudDemoItem,
};

export const Default: StoryObj = {
  render: Template,
  decorators: [withProviders({})],
};
