import { render } from '@sb/webapp-core/tests/utils/rendering';
import { screen } from '@testing-library/react';

import { Admin } from '../admin.component';

describe('Admin: Component', () => {
  const Component = () => <Admin />;

  it('should display data', async () => {
    render(<Component />);

    expect(screen.getByText(/This page is only visible for admins/i)).toBeInTheDocument();
    expect(screen.getByText(/It's fully secure/i)).toBeInTheDocument();
    expect(screen.getByText(/Regular users do not have access here/i)).toBeInTheDocument();
  });
});
