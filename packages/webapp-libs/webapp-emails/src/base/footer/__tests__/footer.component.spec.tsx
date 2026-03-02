import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { Footer } from '../';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale="en" messages={{}}>
    {children}
  </IntlProvider>
);

describe('Footer', () => {
  test('renders default company name and copyright', () => {
    render(<Footer />, { wrapper: Wrapper });
    expect(screen.getByText(/All rights reserved\./)).toBeInTheDocument();
  });

  test('renders custom company name', () => {
    render(<Footer companyName="Acme Inc" />, { wrapper: Wrapper });
    expect(screen.getByText(/Acme Inc/)).toBeInTheDocument();
  });

  test('renders address when provided', () => {
    render(<Footer address="123 Main St" />, { wrapper: Wrapper });
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });

  test('renders social links when provided', () => {
    render(
      <Footer
        socialLinks={{
          twitter: 'https://twitter.com/acme',
          github: 'https://github.com/acme',
        }}
      />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  test('renders unsubscribe link when provided', () => {
    render(<Footer unsubscribeUrl="https://example.com/unsubscribe" />, { wrapper: Wrapper });
    expect(screen.getByText('Unsubscribe')).toBeInTheDocument();
  });

  test('renders privacy and terms links when provided', () => {
    render(
      <Footer privacyUrl="https://example.com/privacy" termsUrl="https://example.com/terms" />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  test('renders children when provided', () => {
    render(<Footer>Extra content</Footer>, { wrapper: Wrapper });
    expect(screen.getByText('Extra content')).toBeInTheDocument();
  });

  test('does not render social links when all are empty', () => {
    render(<Footer socialLinks={{}} />, { wrapper: Wrapper });
    expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
  });
});
