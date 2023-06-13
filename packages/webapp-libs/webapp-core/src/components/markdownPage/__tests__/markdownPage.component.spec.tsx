import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { MarkdownPage, MarkdownPageProps } from '../markdownPage.component';

describe('MarkdownPage: Component', () => {
  const defaultProps: MarkdownPageProps = {
    markdown: 'Example',
  };

  const Component = (props: Partial<MarkdownPageProps>) => <MarkdownPage {...defaultProps} {...props} />;

  it('should render simple paragraph text', async () => {
    render(<Component markdown="Paragraph content" />);
    expect(await screen.findByText('Paragraph content')).toBeInTheDocument();
  });

  it('should render headings', async () => {
    render(<Component markdown="### Title" />);
    expect(await screen.findByRole('heading', { name: 'Title' })).toBeInTheDocument();
  });

  it('should render unordered list', async () => {
    render(<Component markdown={'* item \n * another item'} />);
    // additional item from Toast element
    expect(await screen.findAllByRole('list')).toHaveLength(2);
    const allListItems = screen.getAllByRole('listitem').map((i) => i.textContent);
    expect(allListItems).toEqual(['item', 'another item']);
  });

  it('should render ordered list', async () => {
    render(<Component markdown={'1) item \n 2) another item'} />);
    // additional item from Toast element
    expect(await screen.findAllByRole('list')).toHaveLength(2);
    const allListItems = screen.getAllByRole('listitem').map((i) => i.textContent);
    expect(allListItems).toEqual(['item', 'another item']);
  });
});
