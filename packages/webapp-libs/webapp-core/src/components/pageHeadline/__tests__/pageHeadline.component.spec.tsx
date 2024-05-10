import { screen } from '@testing-library/react';

import { PageHeadline, PageHeadlineProps } from '../';
import { render } from '../../../tests/utils/rendering';

describe('PageHeadline', () => {
  const header = 'Test header';
  const defaultProps: PageHeadlineProps = {
    header,
  };
  const Component = (props: Partial<PageHeadlineProps>) => <PageHeadline {...defaultProps} {...props} />;

  it('Should render page headline with header', async () => {
    render(<Component data-testid="testid" className="h-12" />);

    expect(screen.getByTestId('testid').className).toContain('h-12');
    expect(screen.getByText(header)).toBeInTheDocument();
  });

  it('Should render page headline with subheader', async () => {
    const subheader = 'Test subheader';
    render(<Component subheader={subheader} />);

    expect(screen.getByText(subheader)).toBeInTheDocument();
  });

  it('Should render page headline with back btn', async () => {
    render(<Component hasBackButton />);

    expect(screen.getByText('Go back')).toBeInTheDocument();
  });
});
