import { screen } from '@testing-library/react';
import React from 'react';
import { render } from '../../../tests/utils/rendering';

import { Skeleton } from '../';

describe('Skeleton', () => {
  it('Should render rounded skeleton', async () => {
    render(<Skeleton data-testid="testid" className="h-12 w-12 rounded-full" />);

    expect(await screen.getByTestId('testid').className).toContain('h-12 w-12 rounded-full');
  });
});
