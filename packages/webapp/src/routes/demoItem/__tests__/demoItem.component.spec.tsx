import { screen } from '@testing-library/react';
import { append } from 'ramda';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../app/config/routes';
import { demoItemFactory, fillDemoItemQuery } from '../../../mocks/factories';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { DemoItem } from '../demoItem.component';

describe('DemoItem: Component', () => {
  const routePath = ['demoItem'];

  const demoItem = demoItemFactory({
    title: 'First',
    description: 'Something more',
    image: {
      description: 'Image',
    },
  });

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<DemoItem />} />
    </Routes>
  );

  it('should render item data', async () => {
    const routerProps = createMockRouterProps(routePath, { id: 'test-id' });
    const requestMock = fillDemoItemQuery(demoItem, { id: 'test-id' });

    const imageTitle = demoItem.image?.title as string;

    render(<Component />, {
      apolloMocks: append(requestMock),
      routerProps,
    });

    expect(await screen.findByText('First')).toBeInTheDocument();
    expect(screen.getByText('Something more')).toBeInTheDocument();
    expect(screen.getByAltText(imageTitle)).toBeInTheDocument();
  });
});
