import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { AddCrudDemoItem } from './addCrudDemoItem.component';

const Template: StoryFn = () => {
  return <AddCrudDemoItem />;
};

export default {
  title: 'CrudDemoItem / AddCrudDemoItem',
  component: AddCrudDemoItem,
};

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};
