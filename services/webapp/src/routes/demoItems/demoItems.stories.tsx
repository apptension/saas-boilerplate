import { Story } from '@storybook/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { RoutesConfig } from '../../app/config/routes';
import { demoItemFactory } from '../../mocks/factories';
import { generateRelayEnvironment } from '../../shared/hooks/useFavoriteDemoItem/useFavoriteDemoItem.fixtures';
import demoItemsAllQueryGraphql from './__generated__/demoItemsAllQuery.graphql';
import { DemoItems } from './demoItems.component';

const items = [demoItemFactory(), demoItemFactory(), demoItemFactory()];

const relayEnvironment = createMockEnvironment();
relayEnvironment.mock.queueOperationResolver((operation) =>
  MockPayloadGenerator.generate(operation, {
    DemoItemCollection() {
      return { items };
    },
  })
);
relayEnvironment.mock.queuePendingOperation(demoItemsAllQueryGraphql, {});

const Template: Story = ({ hasFavourite = false, ...args }) => {
  const relayEnvironment = generateRelayEnvironment(hasFavourite ? items[0].sys.id : null);

  return (
    <ProvidersWrapper
      context={{
        relayEnvironment,
        router: { url: `/en${RoutesConfig.demoItems}`, routePath: `/:lang${RoutesConfig.demoItems}` },
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
WithFavorited.args = { hasFavourite: true };
