import { getLocalePath } from '@sb/webapp-core/utils';
import { screen } from '@testing-library/react';
import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';

import { render } from '../../tests/utils/rendering';
import { RoutesConfig } from '../config/routes';
import { ValidRoutesProviders } from '../providers';

describe('App: Component', () => {
  const Component: FC = () => (
    <Routes>
      <Route element={<ValidRoutesProviders />}>
        <Route path={getLocalePath(RoutesConfig.home)} element={<span data-testid="content" />} />
      </Route>
    </Routes>
  );

  it('should render App when language is set', async () => {
    render(<Component />, { routerProps: { initialEntries: ['/en'] } });
    expect(await screen.findByTestId('content')).toBeInTheDocument();
  });

  it('should render nothing when language is not set', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation((fn) => fn);
    const { waitForApolloMocks } = render(<Component />, {
      routerProps: { initialEntries: ['/'] },
    });
    await waitForApolloMocks();

    expect(warn).toBeCalledWith('No routes matched location "/" ');
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();

    warn.mockRestore();
  });
});
