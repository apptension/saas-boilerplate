import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { Layout } from '../';

const testTitle = 'title';
const testText = 'text';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale="en" messages={{}}>
    {children}
  </IntlProvider>
);

describe('Layout', () => {
  test('should render with title and text', () => {
    render(<Layout title={testTitle} text={testText} />, { wrapper: Wrapper });

    expect(screen.getByText(testTitle)).toBeInTheDocument();
    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  test('should render with children', () => {
    const testChild = <div>child</div>;

    render(
      <Layout title={testTitle} text={testText}>
        {testChild}
      </Layout>,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('child')).toBeInTheDocument();
  });

  test('should render without footer when hideFooter is true', () => {
    render(<Layout title={testTitle} text={testText} hideFooter />, { wrapper: Wrapper });

    expect(screen.queryByText('All rights reserved.')).not.toBeInTheDocument();
  });

  test('should render preheader when provided', () => {
    const preheaderText = 'Preview text for email clients';
    render(<Layout title={testTitle} text={testText} preheader={preheaderText} />, { wrapper: Wrapper });

    // Use a function matcher because preheader adds whitespace padding
    expect(screen.getByText((content) => content.includes(preheaderText))).toBeInTheDocument();
  });
});
