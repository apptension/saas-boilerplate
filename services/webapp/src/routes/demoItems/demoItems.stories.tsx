import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { ROUTES } from '../../app/config/routes';
import { AllDemoItemsDocument } from '../../shared/services/contentful';
import { demoItemFactory } from '../../mocks/factories';
import { prepareState } from '../../mocks/store';
import { DemoItems } from './demoItems.component';

const items = [demoItemFactory(), demoItemFactory(), demoItemFactory()];
const apolloMocks = [
  {
    request: {
      query: AllDemoItemsDocument,
    },
    result: {
      data: {
        demoItemCollection: {
          items,
        },
      },
    },
  },
];

const Template: Story = ({ favorited = [], ...args }) => {
  const store = prepareState((state) => {
    state.demoItems.favorites = favorited;
  });

  return (
    <ProvidersWrapper
      context={{
        store,
        apolloMocks,
        router: { url: `/en${ROUTES.demoItems}`, routePath: `/:lang${ROUTES.demoItems}` },
      }}
    >
      <DemoItems {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'ContentfulDemo / DemoItems',
  component: DemoItems,
};

export const Default = Template.bind({});

export const WithFavorited = Template.bind({});
WithFavorited.args = { favorited: [items[0].sys.id, items[2].sys.id] };
