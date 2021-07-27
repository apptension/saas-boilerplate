import { Story } from '@storybook/react';
import { generatePath } from 'react-router';
import { DemoItemDocument } from '../../shared/services/contentful';
import { demoItemFactory } from '../../mocks/factories';
import { ROUTES } from '../../app/config/routes';
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
        router: { url: generatePath(ROUTES.demoItem, { lang: 'en', id: 1 }), routePath: ROUTES.demoItem },
      }}
    >
      <DemoItem {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'ContentfulDemo / DemoItem',
  component: DemoItem,
};

export const Default = Template.bind({});
