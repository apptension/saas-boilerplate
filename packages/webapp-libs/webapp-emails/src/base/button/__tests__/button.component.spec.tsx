import { screen } from '@testing-library/react';

import { Button } from '../';
import { render } from '../../../tests/utils/rendering';

const linkTo = '/example';
const testId = 'test-button';
const buttonText = 'Click me!';

describe('Button', () => {
  test('should render button with correct href attribute', async () => {
    render(
      <Button linkTo={linkTo} data-testid={testId}>
        {buttonText}
      </Button>
    );

    const button = await screen.findByTestId(testId);
    expect(button.getAttribute('href')).toEqual(`${process.env.PUBLIC_URL}${linkTo}`);
  });

  test('should render external link', async () => {
    const externalLink = 'https://example.com';

    render(
      <Button linkTo={externalLink} data-testid={testId}>
        {buttonText}
      </Button>
    );

    const button = await screen.findByTestId(testId);
    expect(button.getAttribute('href')).toEqual(externalLink);
  });

  test('should render button with correct text', async () => {
    render(<Button linkTo={linkTo}>{buttonText}</Button>);

    expect(await screen.findByText(buttonText)).toBeInTheDocument();
  });
});
