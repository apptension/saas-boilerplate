import React from 'react';

import { screen } from '@testing-library/dom';
import { makeContextRenderer } from '../../../utils/testUtils';
import { MarkdownPage, MarkdownPageProps } from '../markdownPage.component';

describe('MarkdownPage: Component', () => {
  const defaultProps: MarkdownPageProps = {
    markdown: 'Example',
  };

  const component = (props: Partial<MarkdownPageProps>) => <MarkdownPage {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render simple paragraph text', () => {
    render({ markdown: 'Paragraph content' });
    expect(screen.getByText('Paragraph content')).toBeInTheDocument();
  });

  it('should render headings', () => {
    render({ markdown: '### Title' });
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
  });

  it('should render unordered list', () => {
    render({ markdown: '* item \n * another item' });
    expect(screen.getByRole('list')).toBeInTheDocument();
    const allListItems = screen.getAllByRole('listitem').map((i) => i.textContent);
    expect(allListItems).toEqual(['item', 'another item']);
  });

  it('should render ordered list', () => {
    render({ markdown: '1) item \n 2) another item' });
    expect(screen.getByRole('list')).toBeInTheDocument();
    const allListItems = screen.getAllByRole('listitem').map((i) => i.textContent);
    expect(allListItems).toEqual(['item', 'another item']);
  });
});
