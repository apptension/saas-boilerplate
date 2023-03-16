import { render, screen } from '@testing-library/react';

import { Image } from '../';

const testId = 'test-image';
const src = 'example.png';

jest.mock('@sb/webapp-core/config/env', () => ({
  ENV: {
    EMAIL_ASSETS_URL: 'https://example.com',
  },
}));

describe('Image', () => {
  test('should render with correct src and alt attributes', () => {
    render(<Image src={src} data-testid={testId} />);

    const image = screen.getByTestId(testId);

    expect(image.getAttribute('src')).toEqual(`https://example.com/${src}`);
    expect(image.getAttribute('alt')).toEqual('');
  });

  test('should render with provided alt text', () => {
    const altText = 'Example Image';

    render(<Image src={src} alt={altText} />);

    expect(screen.getByAltText(altText)).toBeInTheDocument();
  });
});
