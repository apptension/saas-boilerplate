import { render } from '@sb/webapp-core/tests/utils/rendering';
import { screen } from '@testing-library/react';

import { Admin } from '../admin.component';

describe('Admin: Component', () => {
  const Component = () => <Admin />;

  it('should display the admin page content', async () => {
    render(<Component />);

    // Check hero section content - use role for h1 to be more specific
    expect(screen.getByRole('heading', { level: 1, name: /Role-Based Access Control/i })).toBeInTheDocument();
    expect(screen.getByText(/Access Verified/i)).toBeInTheDocument();

    // Check feature cards (use getAllByText for elements that appear multiple times)
    expect(screen.getByText(/Two-Tier Role System/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tenant-Level Roles/i).length).toBeGreaterThan(0);

    // Check implementation sections (Protected Routes appears in feature cards and extending section)
    expect(screen.getAllByText(/Protecting Routes/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Conditional Rendering/i)).toBeInTheDocument();

    // Check extending roles section
    expect(screen.getByText(/Extending Roles/i)).toBeInTheDocument();

    // Check file structure section
    expect(screen.getByText(/Key Files & Locations/i)).toBeInTheDocument();
  });

  it('should display documentation links', async () => {
    render(<Component />);

    expect(screen.getByText(/Backend Users Docs/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Tenancy Docs/i)).toBeInTheDocument();
  });

  it('should display how it works explanation', async () => {
    render(<Component />);

    expect(screen.getByText(/How This Page Works/i)).toBeInTheDocument();
  });
});
