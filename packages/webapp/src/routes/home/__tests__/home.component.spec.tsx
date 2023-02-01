import { screen } from '@testing-library/react';
import { Home } from '../home.component';
import { render } from '../../../tests/utils/rendering';

describe('Home: Component', () => {
  const Component = () => <Home />;

  it('should display welcome message', async () => {
    render(<Component />);
    expect(await screen.findByText('Welcome!')).toBeInTheDocument();
  });
});
