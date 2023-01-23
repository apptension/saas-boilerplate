import { Story } from '@storybook/react';
import { withProviders } from '../../../shared/utils/storybook';
import { AddCrudDemoItem } from './addCrudDemoItem.component';

const Template: Story = () => {
  return <AddCrudDemoItem />;
};

export default {
  title: 'CrudDemoItem / AddCrudDemoItem',
  component: AddCrudDemoItem,
};

export const Default = Template.bind({});
Default.decorators = [withProviders({})];
