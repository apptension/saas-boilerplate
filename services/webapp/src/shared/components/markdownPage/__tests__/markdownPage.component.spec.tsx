import { screen } from '@testing-library/react';
import { render } from '../../../../tests/utils/rendering';
import { MarkdownPage, MarkdownPageProps } from '../markdownPage.component';

describe('MarkdownPage: Component', () => {
  const defaultProps: MarkdownPageProps = {
    markdown: 'Example',
  };

  const Component = (props: Partial<MarkdownPageProps>) => <MarkdownPage {...defaultProps} {...props} />;

  it('should render simple paragraph text', () => {
    render(<Component markdown="Paragraph content" />);
    expect(screen.getByText('Paragraph content')).toBeInTheDocument();
  });

  it('should render headings', () => {
    render(<Component markdown="### Title" />);
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
  });

  it('should render unordered list', () => {
    render(<Component markdown={'* item \n * another item'} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    const allListItems = screen.getAllByRole('listitem').map((i) => i.textContent);
    expect(allListItems).toEqual(['item', 'another item']);
  });

  it('should render ordered list', () => {
    render(<Component markdown={'1) item \n 2) another item'} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    const allListItems = screen.getAllByRole('listitem').map((i) => i.textContent);
    expect(allListItems).toEqual(['item', 'another item']);
  });
});
