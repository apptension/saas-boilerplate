import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Home } from '../home.component';

describe('Home: Component', () => {
  const Component = () => <Home />;

  it('should display headline', async () => {
    render(<Component />);
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('should display dashboard items', async () => {
    render(<Component />);
    // 6 items + heading + alert
    expect(await screen.findAllByRole('heading')).toHaveLength(8);
  });
});
