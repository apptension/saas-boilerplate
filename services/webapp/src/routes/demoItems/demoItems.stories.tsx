import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { ROUTES } from '../app.constants';
import { AllDemoItemsDocument } from '../../shared/services/contentful';
import { demoItemFactory } from '../../mocks/factories';
import { DemoItems } from './demoItems.component';

const apolloMocks = [
  {
    request: {
      query: AllDemoItemsDocument,
    },
    result: {
      data: {
        demoItemCollection: {
          items: [demoItemFactory(), demoItemFactory(), demoItemFactory()],
        },
      },
    },
  },
];

const Template: Story = (args) => {
  return (
    <ProvidersWrapper
      context={{ apolloMocks, router: { url: `/en${ROUTES.demoItems}`, routePath: `/:lang${ROUTES.demoItems}` } }}
    >
      <DemoItems {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'DemoItems',
  component: DemoItems,
};

export const Default = Template.bind({});
