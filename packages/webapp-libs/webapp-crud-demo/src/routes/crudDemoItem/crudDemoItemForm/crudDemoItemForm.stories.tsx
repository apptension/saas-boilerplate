import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { CrudDemoItemForm, CrudDemoItemFormProps } from './crudDemoItemForm.component';

const Template: StoryFn<CrudDemoItemFormProps> = (args: CrudDemoItemFormProps) => {
  return <CrudDemoItemForm {...args} />;
};

const meta: Meta = {
  title: 'Crud Demo Item / CrudDemoItemForm',
  component: Template,
};

export default meta;

export const WithInitialData: StoryObj<typeof meta> = {
  args: {
    initialData: {
      name: 'initial name',
    },
  },

  decorators: [withProviders({})],
};

export const WithoutData: StoryObj<typeof meta> = {
  decorators: [withProviders({})],
};
