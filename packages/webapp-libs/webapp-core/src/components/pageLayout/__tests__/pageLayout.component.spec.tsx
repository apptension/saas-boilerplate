import { screen } from '@testing-library/react';

import { PageLayout } from '../';
import { render } from '../../../tests/utils/rendering';

describe('PageLayout', () => {
  it('Should render page layout', async () => {
    render(<PageLayout data-testid="testid" className="h-12" />);

    expect(screen.getByTestId('testid').className).toContain('flex-1 space-y-8 px-8 lg:max-w-3xl');
  });
});
