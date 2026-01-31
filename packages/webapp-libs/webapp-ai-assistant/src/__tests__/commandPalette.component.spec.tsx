import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

// Mock the useCurrentTenant hook
jest.mock('@sb/webapp-tenants/providers', () => ({
  useCurrentTenant: () => ({
    data: { id: 'test-tenant-123', name: 'Test Tenant' },
  }),
}));

// Mock the ENV
jest.mock('@sb/webapp-core/config/env', () => ({
  ENV: {
    BASE_API_URL: 'http://localhost:5001',
  },
}));

// Import after mocks
import { CommandPalette } from '../components/commandPalette';

const renderWithIntl = (component: React.ReactNode) => {
  return render(
    <IntlProvider locale="en" messages={{}}>
      {component}
    </IntlProvider>
  );
};

describe('CommandPalette', () => {
  it('renders the trigger button', () => {
    renderWithIntl(<CommandPalette />);
    
    // Should render a button
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('opens dialog when trigger button is clicked', async () => {
    renderWithIntl(<CommandPalette />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Dialog should be open
    expect(await screen.findByText(/AI Assistant/i)).toBeInTheDocument();
  });

  it('opens dialog with Cmd+K keyboard shortcut', async () => {
    renderWithIntl(<CommandPalette />);
    
    // Simulate Cmd+K
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    // Dialog should be open
    expect(await screen.findByText(/AI Assistant/i)).toBeInTheDocument();
  });

  it('opens dialog with Ctrl+K keyboard shortcut', async () => {
    renderWithIntl(<CommandPalette />);
    
    // Simulate Ctrl+K
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    
    // Dialog should be open
    expect(await screen.findByText(/AI Assistant/i)).toBeInTheDocument();
  });

  it('shows welcome message when dialog opens', async () => {
    renderWithIntl(<CommandPalette />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Should show welcome message
    expect(await screen.findByText(/help you explore your data/i)).toBeInTheDocument();
  });

  it('shows example prompts', async () => {
    renderWithIntl(<CommandPalette />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Should show "Try asking:" label
    expect(await screen.findByText(/Try asking/i)).toBeInTheDocument();
    
    // Should show example prompt buttons
    expect(await screen.findByText(/active projects/i)).toBeInTheDocument();
  });

  it('renders custom trigger when provided', () => {
    const customTrigger = <button data-testid="custom-trigger">Custom Trigger</button>;
    
    renderWithIntl(<CommandPalette trigger={customTrigger} />);
    
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
  });
});

describe('useAiAssistant', () => {
  // Additional hook tests would go here
  // For now, the hook is tested indirectly through the component tests
});
