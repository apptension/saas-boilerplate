import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { H1, H2, H3, H4, Paragraph, ParagraphBold, Small } from '../typography';

describe('Typography: Component', () => {
  const Component = () => (
    <div>
      <H1>Heading 1</H1>
      <H2>Heading 2</H2>
      <H3>Heading 3</H3>
      <H4>Heading 4</H4>
      <Paragraph>Paragraph</Paragraph>
      <ParagraphBold>Paragraph bold</ParagraphBold>
      <Small>Small</Small>
    </div>
  );

  it('should display entered typography', async () => {
    render(<Component />);

    expect(screen.getByText('Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Heading 2')).toBeInTheDocument();
    expect(screen.getByText('Heading 3')).toBeInTheDocument();
    expect(screen.getByText('Heading 4')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Paragraph bold')).toBeInTheDocument();
    expect(screen.getByText('Small')).toBeInTheDocument();
  });
});
