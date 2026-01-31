import { screen, waitFor } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';

describe('UI/Avatar: Component', () => {
  it('should render fallback', async () => {
    render(
      <Avatar>
        <AvatarImage />
        <AvatarFallback delayMs={0}>Test</AvatarFallback>
      </Avatar>
    );

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
