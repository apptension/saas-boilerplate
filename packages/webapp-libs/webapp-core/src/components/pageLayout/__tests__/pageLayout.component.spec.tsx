import { screen } from '@testing-library/react';

import { PageLayout } from '../';
import { render } from '../../../tests/utils/rendering';

describe('PageLayout', () => {
  it('Should render page layout', async () => {
    render(<PageLayout data-testid="testid" className="h-12" />);

    const element = screen.getByTestId('testid');
    expect(element.className).toContain('flex-1');
    expect(element.className).toContain('space-y-8');
    expect(element.className).toContain('px-4');
  });
});
