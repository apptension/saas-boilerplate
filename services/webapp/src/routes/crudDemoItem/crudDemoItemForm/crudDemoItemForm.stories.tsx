import { Story } from '@storybook/react';
import { withProviders } from '../../../shared/utils/storybook';
import { CrudDemoItemForm, CrudDemoItemFormProps } from './crudDemoItemForm.component';

const Template: Story<CrudDemoItemFormProps> = (args: CrudDemoItemFormProps) => {
  return <CrudDemoItemForm {...args} />;
};

export default {
  title: 'CrudDemoItem / CrudDemoItemForm',
  component: CrudDemoItemForm,
};

export const WithInitialData = Template.bind({});
WithInitialData.args = {
  initialData: {
    name: 'initial name',
  },
};
WithInitialData.decorators = [withProviders({})];

export const WithoutData = Template.bind({});
WithoutData.args = {};
WithoutData.decorators = [withProviders({})];
