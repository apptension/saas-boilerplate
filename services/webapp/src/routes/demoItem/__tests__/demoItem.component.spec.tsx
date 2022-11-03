import { screen, waitFor } from '@testing-library/react';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { Route, Routes } from 'react-router';

import { createMockRouterHistory, render } from '../../../tests/utils/rendering';
import { DemoItem } from '../demoItem.component';
import { RoutesConfig } from '../../../app/config/routes';
import demoItemQueryGraphql from '../__generated__/demoItemQuery.graphql';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';

describe('DemoItem: Component', () => {
  const routePath = ['demoItem'];

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<DemoItem />} />
    </Routes>
  );

  it('should render item data', async () => {
    const routerHistory = createMockRouterHistory(routePath, { id: 'test-id' });
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
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

    render(<Component />, { relayEnvironment, routerHistory });

    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
    });
    expect(screen.getByText('Something more')).toBeInTheDocument();
    expect(screen.getByAltText('image alt')).toBeInTheDocument();
  });
});
