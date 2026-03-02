import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

jest.mock('@sb/webapp-tenants/providers', () => ({
  useCurrentTenant: () => ({
    data: { id: 'test-tenant-123', name: 'Test Tenant' },
  }),
}));

jest.mock('@sb/webapp-core/config/env', () => ({
  ENV: {
    BASE_API_URL: 'http://localhost:5001',
  },
}));

jest.mock('../hooks/useAiAssistant', () => ({
  useAiAssistant: () => ({
    messages: [],
    isLoading: false,
    error: null,
    sendMessage: jest.fn(),
    clearMessages: jest.fn(),
    isConnected: true,
    streamingState: { status: null, activeTools: [], isStreaming: false },
  }),
}));

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

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('opens dialog with Cmd+K keyboard shortcut', async () => {
    renderWithIntl(<CommandPalette />);

    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('opens dialog with Ctrl+K keyboard shortcut', async () => {
    renderWithIntl(<CommandPalette />);

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('shows welcome message when dialog opens', async () => {
    renderWithIntl(<CommandPalette />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(await screen.findByText(/How can I help you today/i)).toBeInTheDocument();
  });

  it('shows example prompts', async () => {
    renderWithIntl(<CommandPalette />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(await screen.findByText(/List my items/i)).toBeInTheDocument();
    expect(await screen.findByText(/Show my documents/i)).toBeInTheDocument();
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
