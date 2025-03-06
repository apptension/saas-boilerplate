import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { withProviders } from '@sb/webapp-crud-demo/utils/storybook';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

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
