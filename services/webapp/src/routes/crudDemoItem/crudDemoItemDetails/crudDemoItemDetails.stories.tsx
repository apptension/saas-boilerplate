import React from 'react';
import { Story } from '@storybook/react';

import { generatePath } from 'react-router';
import { ProvidersWrapper } from '../../../shared/utils/testUtils';
import { crudDemoItemFactory } from '../../../mocks/factories';
import { prepareState } from '../../../mocks/store';
import { ROUTES } from '../../app.constants';
import { CrudDemoItemDetails } from './crudDemoItemDetails.component';

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
          url: `/en${generatePath(ROUTES.crudDemoItem.details, { id: item.id })}`,
          routePath: `/:lang${ROUTES.crudDemoItem.details}`,
        },
      }}
    >
      <CrudDemoItemDetails {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'CrudDemoItem / CrudDemoItemDetails',
  component: CrudDemoItemDetails,
};

export const Default = Template.bind({});
