import { screen } from '@testing-library/react';
import React from 'react';

import { render } from '../../../tests/utils/rendering';
import { Separator } from '../separator.component';

describe('Separator: Component', () => {
  it('should render', async () => {
    render(<Separator />);

    expect(screen.getByTestId('Separator')).toBeDefined();
  });
});
