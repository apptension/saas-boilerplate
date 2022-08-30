import { Story } from '@storybook/react';
import { generatePath } from 'react-router';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';

import demoItemQueryGraphql from '../../__generated__/demoItemQuery.graphql';
import { RoutesConfig } from '../../app/config/routes';
import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { demoItemFactory } from '../../mocks/factories';
import { DemoItem } from './demoItem.component';

const defaultItemId = 'test-id';
const relayEnvironment = createMockEnvironment();
relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
  MockPayloadGenerator.generate(operation, {
    DemoItem() {
      return demoItemFactory();
    },
  })
);
relayEnvironment.mock.queuePendingOperation(demoItemQueryGraphql, { id: defaultItemId });

const Template: Story = () => {
  return (
    <ProvidersWrapper
      context={{
        relayEnvironment,
        router: { url: generatePath(RoutesConfig.demoItem, { lang: 'en', id: '1' }), routePath: RoutesConfig.demoItem },
      }}
    >
      <DemoItem />
    </ProvidersWrapper>
  );
};

export default {
  title: 'ContentfulDemo / DemoItem',
  component: DemoItem,
};

export const Default = Template.bind({});
