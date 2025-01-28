import { render, screen } from '@testing-library/react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card';

describe('UI/Card: Component', () => {
  const content = 'content';
  const header = 'header';
  const footer = 'footer';
  const title = 'title';

  it('should redner card with all components', async () => {
    render(
      <Card>
        <CardHeader>{header}</CardHeader>
        <CardContent>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{content}</CardDescription>
        </CardContent>
        <CardFooter>{footer}</CardFooter>
      </Card>
    );

    expect(await screen.findByText(content)).toBeInTheDocument();
    expect(await screen.findByText(footer)).toBeInTheDocument();
    expect(await screen.findByText(header)).toBeInTheDocument();
    expect(await screen.findByText(title)).toBeInTheDocument();
  });
});
