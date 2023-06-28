import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';

import { fillCrudDemoItemListQuery } from '../../../tests/factories';
import { withProviders } from '../../../utils/storybook';
import { CrudDemoItemList } from './crudDemoItemList.component';

const Template: StoryFn = () => {
  return <CrudDemoItemList />;
};

const meta: Meta = {
  title: 'Crud Demo Item / CrudDemoItemList',
  component: CrudDemoItemList,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      apolloMocks: append(fillCrudDemoItemListQuery()),
    }),
  ],
};
