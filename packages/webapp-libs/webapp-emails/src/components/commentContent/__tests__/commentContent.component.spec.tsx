import { render, screen } from '@testing-library/react';

import { CommentContent } from '../';

describe('CommentContent', () => {
  test('renders plain text content', () => {
    render(<CommentContent content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  test('renders mention with userId:userName format', () => {
    render(<CommentContent content="Hello @[user-123:John Doe]" />);
    expect(screen.getByText('@John Doe')).toBeInTheDocument();
  });

  test('renders mention without colon', () => {
    render(<CommentContent content="Hello @[user-123]" />);
    expect(screen.getByText('@user-123')).toBeInTheDocument();
  });

  test('renders multiple mentions', () => {
    render(<CommentContent content="Hi @[1:Alice] and @[2:Bob]" />);
    expect(screen.getByText('@Alice')).toBeInTheDocument();
    expect(screen.getByText('@Bob')).toBeInTheDocument();
  });

  test('renders h1 heading', () => {
    render(<CommentContent content="# Main heading" />);
    expect(screen.getByText('Main heading')).toBeInTheDocument();
  });

  test('renders h2 heading', () => {
    render(<CommentContent content="## Sub heading" />);
    expect(screen.getByText('Sub heading')).toBeInTheDocument();
  });

  test('renders h3 heading', () => {
    render(<CommentContent content="### Small heading" />);
    expect(screen.getByText('Small heading')).toBeInTheDocument();
  });

  test('renders horizontal rule', () => {
    const { container } = render(<CommentContent content="---" />);
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  test('renders blockquote', () => {
    render(<CommentContent content="> Quote text" />);
    expect(screen.getByText('Quote text')).toBeInTheDocument();
  });

  test('renders unordered list', () => {
    const { container } = render(<CommentContent content="- Item one\n- Item two" />);
    const list = container.querySelector('ul');
    expect(list).toBeInTheDocument();
    expect(list?.textContent).toContain('Item one');
    expect(list?.textContent).toContain('Item two');
  });

  test('renders ordered list', () => {
    const { container } = render(<CommentContent content="1. First\n2. Second" />);
    const list = container.querySelector('ol');
    expect(list).toBeInTheDocument();
    expect(list?.textContent).toContain('First');
    expect(list?.textContent).toContain('Second');
  });

  test('renders bold text', () => {
    render(<CommentContent content="Hello **bold** world" />);
    expect(screen.getByText('bold')).toBeInTheDocument();
  });

  test('renders italic text', () => {
    render(<CommentContent content="Hello _italic_ world" />);
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  test('renders inline code', () => {
    render(<CommentContent content="Use `code` here" />);
    expect(screen.getByText('code')).toBeInTheDocument();
  });

  test('renders empty content', () => {
    const { container } = render(<CommentContent content="" />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  test('renders content with only whitespace as fallback', () => {
    const { container } = render(<CommentContent content="   \n" />);
    expect(container.querySelector('p')).toBeInTheDocument();
  });

  test('renders mention in heading', () => {
    render(<CommentContent content="# Hello @[1:Alice]" />);
    expect(screen.getByText('@Alice')).toBeInTheDocument();
  });

  test('renders mention in blockquote', () => {
    render(<CommentContent content="> Mention @[1:Bob]" />);
    expect(screen.getByText('@Bob')).toBeInTheDocument();
  });
});
