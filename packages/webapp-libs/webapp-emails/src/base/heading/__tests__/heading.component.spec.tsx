import { render, screen } from '@testing-library/react';

import { Heading } from '../';

describe('Heading', () => {
  test('renders h2 by default', () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  test('renders h1 when level is 1', () => {
    const { container } = render(<Heading level={1}>H1</Heading>);
    const heading = container.querySelector('h1');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('H1');
  });

  test('renders h3 when level is 3', () => {
    const { container } = render(<Heading level={3}>H3</Heading>);
    expect(container.querySelector('h3')).toHaveTextContent('H3');
  });

  test('renders h4 when level is 4', () => {
    const { container } = render(<Heading level={4}>H4</Heading>);
    expect(container.querySelector('h4')).toHaveTextContent('H4');
  });

  test('renders with left alignment', () => {
    render(<Heading align="left">Left</Heading>);
    expect(screen.getByText('Left')).toBeInTheDocument();
  });

  test('renders with right alignment', () => {
    render(<Heading align="right">Right</Heading>);
    expect(screen.getByText('Right')).toBeInTheDocument();
  });
});
