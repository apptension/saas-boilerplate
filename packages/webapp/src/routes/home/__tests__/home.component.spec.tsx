import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Home } from '../home.component';

describe('Home: Component', () => {
  const Component = () => <Home />;

  it('should display welcome message', async () => {
    render(<Component />);
    expect(await screen.findByText('Welcome!')).toBeInTheDocument();
  });
});
