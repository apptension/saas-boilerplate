import { Story } from '@storybook/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { ROUTES } from '../../app/config/routes';
import { prepareState } from '../../mocks/store';
import demoItemsAllQueryGraphql from '../../__generated__/demoItemsAllQuery.graphql';
import { demoItemFactory } from '../../mocks/factories';
import { DemoItems } from './demoItems.component';

const items = [demoItemFactory(), demoItemFactory(), demoItemFactory()];

const relayEnvironment = createMockEnvironment();
relayEnvironment.mock.queueOperationResolver((operation) =>
  MockPayloadGenerator.generate(operation, {
    DemoItemCollection() {
      return {items};
    },
  })
);
relayEnvironment.mock.queuePendingOperation(demoItemsAllQueryGraphql, {});

const Template: Story = ({ favorited = [], ...args }) => {
  const store = prepareState((state) => {
    state.demoItems.favorites = favorited;
  });

  return (
    <ProvidersWrapper
      context={{
        store,
        relayEnvironment,
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
