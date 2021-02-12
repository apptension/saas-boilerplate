import React from 'react';
import { Story } from '@storybook/react';

import { generatePath } from 'react-router';
import { DemoItemDocument } from '../../shared/services/contentful';
import { demoItemFactory } from '../../mocks/factories';
import { ROUTES } from '../app.constants';
import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { DemoItem } from './demoItem.component';

const apolloMocks = [
  {
    request: {
      query: DemoItemDocument,
      variables: { itemId: '1' },
    },
    result: {
      data: {
        demoItem: demoItemFactory(),
      },
    },
  },
];

const Template: Story = (args) => {
  return (
    <ProvidersWrapper
      context={{
        apolloMocks,
        router: { url: `/en${generatePath(ROUTES.demoItem, { id: 1 })}`, routePath: `/:lang${ROUTES.demoItem}` },
      }}
    >
      <DemoItem {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'DemoItem',
  component: DemoItem,
};

export const Default = Template.bind({});
