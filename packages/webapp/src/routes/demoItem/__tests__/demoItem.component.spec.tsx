import { screen, waitFor } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { Route, Routes } from 'react-router';

import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { DemoItem } from '../demoItem.component';
import { RoutesConfig } from '../../../app/config/routes';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';
import { demoItemFactory, fillDemoItemQuery } from '../../../mocks/factories';

describe('DemoItem: Component', () => {
  const routePath = ['demoItem'];

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<DemoItem />} />
    </Routes>
  );

  it('should render item data', async () => {
    const routerProps = createMockRouterProps(routePath, { id: 'test-id' });
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
    const data = {
      ...demoItemFactory(),
      title: 'First',
      description: 'Something more',
    };
    fillDemoItemQuery(relayEnvironment, data, { id: 'test-id' });

    render(<Component />, { relayEnvironment, routerProps });

    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
    });
    expect(screen.getByText('Something more')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByAltText(data.image?.title)).toBeInTheDocument();
  });
});
