import { screen } from '@testing-library/react';

import { Avatar, AvatarFallback, AvatarImage } from '../';
import { render } from '../../../tests/utils/rendering';

describe('Avatar: Component', () => {
  it('should render fallback', async () => {
    render(
      <Avatar>
        <AvatarImage />
        <AvatarFallback>Test</AvatarFallback>
      </Avatar>
    );

    expect(await screen.findByText('Test')).toBeInTheDocument();
  });
});
