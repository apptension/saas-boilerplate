import { screen, waitFor } from '@testing-library/react';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { generatePath } from 'react-router';

import { DemoItem } from '../demoItem.component';
import { makeContextRenderer } from '../../../shared/utils/testUtils';
import { ROUTES } from '../../../app/config/routes';
import demoItemQueryGraphql from '../../../__generated__/demoItemQuery.graphql';

describe('DemoItem: Component', () => {
  const component = () => <DemoItem />;
  const render = makeContextRenderer(component);

  it('should render item data', async () => {
    const relayEnvironment = createMockEnvironment();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        DemoItem: () => ({
          title: 'First',
          description: 'Something more',
          image: { url: 'http://image.url', title: 'image alt' },
        }),
      })
    );
    relayEnvironment.mock.queuePendingOperation(demoItemQueryGraphql, { id: 'test-id' });

    render(
      {},
      {
        relayEnvironment,
        router: { url: generatePath(ROUTES.demoItem, { lang: 'en', id: 'test-id' }), routePath: ROUTES.demoItem },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
    });
    expect(screen.getByText('Something more')).toBeInTheDocument();
    expect(screen.getByAltText('image alt')).toBeInTheDocument();
  });
});
