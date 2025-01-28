import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';

describe('UI/Avatar: Component', () => {
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
