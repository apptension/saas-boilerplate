import React from 'react';
import { Story } from '@storybook/react';

import { generatePath } from 'react-router';
import { ProvidersWrapper } from '../../../shared/utils/testUtils';
import { prepareState } from '../../../mocks/store';
import { crudDemoItemFactory } from '../../../mocks/factories';
import { ROUTES } from '../../app.constants';
import { EditCrudDemoItem } from './editCrudDemoItem.component';

const item = crudDemoItemFactory();
const store = prepareState((state) => {
  state.crudDemoItem.items = [item];
});

const Template: Story = (args) => {
  return (
    <ProvidersWrapper
      context={{
        store,
        router: {
          url: `/en${generatePath(ROUTES.crudDemoItem.edit, { id: item.id })}`,
          routePath: `/:lang${ROUTES.crudDemoItem.edit}`,
        },
      }}
    >
      <EditCrudDemoItem {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'CrudDemoItem / EditCrudDemoItem',
  component: EditCrudDemoItem,
};

export const Default = Template.bind({});
