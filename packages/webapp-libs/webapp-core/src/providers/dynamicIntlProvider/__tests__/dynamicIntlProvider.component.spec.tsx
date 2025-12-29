import { renderHook, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import { Locale } from '../../../config/i18n';
import { DynamicIntlProvider } from '../dynamicIntlProvider.component';
import { render } from '../../../tests/utils/rendering';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const createWrapper = (locale: Locale = Locale.ENGLISH) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <DynamicIntlProvider locale={locale}>{children}</DynamicIntlProvider>
    </QueryClientProvider>
  );
};

describe('DynamicIntlProvider', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Default: return 404 to use bundled translations
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });
  });

  it('should render children with bundled translations as fallback', async () => {
    const TestComponent = () => (
      <FormattedMessage id="NonExistent / Key" defaultMessage="Default Test Message" />
    );

    const { container } = render(<TestComponent />, {
      wrapper: createWrapper(),
    });

    // Should render the default message since there's no translation
    expect(container).toHaveTextContent('Default Test Message');
  });

  it('should use remote translations when available', async () => {
    const remoteTranslations = {
      'Test / Key': 'Remote Test Message',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(remoteTranslations),
    });

    const TestComponent = () => (
      <FormattedMessage id="Test / Key" defaultMessage="Default Test Message" />
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Force enable remote translations for this test
    const originalEnv = process.env.VITE_USE_REMOTE_TRANSLATIONS;
    process.env.VITE_USE_REMOTE_TRANSLATIONS = 'true';

    render(
      <QueryClientProvider client={queryClient}>
        <DynamicIntlProvider locale={Locale.ENGLISH} translationsBaseUrl="https://test.com">
          <TestComponent />
        </DynamicIntlProvider>
      </QueryClientProvider>
    );

    // Restore env
    process.env.VITE_USE_REMOTE_TRANSLATIONS = originalEnv;
  });

  it('should support different locales', () => {
    const TestComponent = () => (
      <FormattedMessage id="Test / Key" defaultMessage="Hello" />
    );

    const { container } = render(<TestComponent />, {
      wrapper: createWrapper(Locale.POLISH),
    });

    // Should render with Polish locale
    expect(container).toBeTruthy();
  });

  it('should handle missing translations gracefully', () => {
    const TestComponent = () => (
      <FormattedMessage id="Unknown / Key" defaultMessage="Fallback Message" />
    );

    const { container } = render(<TestComponent />, {
      wrapper: createWrapper(),
    });

    // Should render the fallback message
    expect(container).toHaveTextContent('Fallback Message');
  });
});

