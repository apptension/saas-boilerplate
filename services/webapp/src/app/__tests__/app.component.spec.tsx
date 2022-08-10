import { screen } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { makeContextRenderer } from '../../shared/utils/testUtils';
import { ValidRoutesProviders } from '../providers/validRoutesProvider';
import { Routes } from '../config/routes';

describe('App: Component', () => {
  const component = () => (
    <ValidRoutesProviders />
  );
  const routePath = Routes.getLocalePath(['home']);
  const defaultRouterContext = {
    children: <Route index element={<span data-testid="content" />} />,
    routePath,
  };
  const render = makeContextRenderer(component, {
    router: defaultRouterContext
  });

  it('should render App when language is set', () => {

    render({ }, { router: { ...defaultRouterContext, url: '/en' } });
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render nothing when language is not set', () => {
    render({ children: <span data-testid="content" /> }, {
      router: {...defaultRouterContext,  url: '/' }
    });
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });
});
