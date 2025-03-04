import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { CrudDemoItemListRowActions, CrudDemoItemListRowActionsProps } from './crudDemoItemListRowActions.component';

const meta: Meta = {
  title: 'Crud Demo Item / CrudDemoItemList / CrudDemoItemListRowActions',
  component: CrudDemoItemListRowActions,
};

export default meta;

const Template: StoryFn<CrudDemoItemListRowActionsProps> = (args) => {
  return <CrudDemoItemListRowActions {...args} />;
};

export const Default: StoryObj<CrudDemoItemListRowActionsProps> = {
  render: Template,
  args: {
    row: {
      id: 'test-id',
      original: {
        id: 'test-id',
        name: 'Test Item',
      },
    } as any,
  },
};
