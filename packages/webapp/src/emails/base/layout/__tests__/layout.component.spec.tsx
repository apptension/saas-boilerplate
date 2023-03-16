import { render, screen } from '@testing-library/react';

import { Layout } from '../';

const testTitle = 'title';
const testText = 'text';

describe('Layout', () => {
  test('should render with title and text', () => {
    render(<Layout title={testTitle} text={testText} />);

    expect(screen.getByText(testTitle)).toBeInTheDocument();
    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  test('should render with children', () => {
    const testChild = <div>child</div>;

    render(
      <Layout title={testTitle} text={testText}>
        {testChild}
      </Layout>
    );

    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
