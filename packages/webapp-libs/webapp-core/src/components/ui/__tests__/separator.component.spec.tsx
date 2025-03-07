import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Separator } from '../separator';

describe('UI/Separator: Component', () => {
  it('should render', async () => {
    render(<Separator data-testid="Separator" />);

    expect(screen.getByTestId('Separator')).toBeDefined();
  });
});
