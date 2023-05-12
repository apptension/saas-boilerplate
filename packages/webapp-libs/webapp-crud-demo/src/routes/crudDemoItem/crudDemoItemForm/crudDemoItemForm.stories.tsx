import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import {
  CrudDemoItemForm,
  CrudDemoItemFormProps,
} from './crudDemoItemForm.component';

const Template: StoryFn<CrudDemoItemFormProps> = (
  args: CrudDemoItemFormProps
) => {
  return <CrudDemoItemForm {...args} />;
};

export default {
  title: 'CrudDemoItem / CrudDemoItemForm',
  component: CrudDemoItemForm,
};

export const WithInitialData = {
  render: Template,

  args: {
    initialData: {
      name: 'initial name',
    },
  },

  decorators: [withProviders({})],
};

export const WithoutData = {
  render: Template,
  args: {},
  decorators: [withProviders({})],
};
