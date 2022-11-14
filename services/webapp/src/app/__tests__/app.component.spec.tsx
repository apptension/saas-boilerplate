import { FC } from 'react';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { ValidRoutesProviders } from '../providers/validRoutesProvider';
import { render } from '../../tests/utils/rendering';
import { RoutesConfig } from '../config/routes';

describe('App: Component', () => {
  const Component: FC = () => (
    <Routes>
      <Route element={<ValidRoutesProviders />}>
        <Route path={RoutesConfig.getLocalePath(['home'])} element={<span data-testid="content" />} />
      </Route>
    </Routes>
  );

  it('should render App when language is set', () => {
    render(<Component />, { routerProps: { initialEntries: ['/en'] } });
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render nothing when language is not set', () => {
    render(<Component />, {
      routerProps: { initialEntries: ['/'] },
    });
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });
});
