import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../../../utils/storybook';
import { CrudDemoItemListRowActions, CrudDemoItemListRowActionsProps } from './crudDemoItemListRowActions.component';

const meta: Meta = {
  title: 'Crud Demo Item / CrudDemoItemList / CrudDemoItemListRowActions',
  component: CrudDemoItemListRowActions,
};

export default meta;

const Template: StoryFn<CrudDemoItemListRowActionsProps> = (args) => {
  return (
    <div className="w-10">
      <CrudDemoItemListRowActions {...args} />
    </div>
  );
};

export const Default: StoryObj<CrudDemoItemListRowActionsProps> = {
  render: Template,
  args: {
    id: 'id',
  },
  decorators: [
    withProviders({
      apolloMocks: [fillCommonQueryWithUser()],
    }),
  ],
};
