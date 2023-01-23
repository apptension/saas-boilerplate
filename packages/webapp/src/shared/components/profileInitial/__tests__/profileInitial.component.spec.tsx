import { screen } from '@testing-library/react';

import { render } from '../../../../tests/utils/rendering';
import { ProfileInitial, formatProfileInitial } from '../profileInitial.component';
import { currentUserFactory } from '../../../../mocks/factories';

describe('ProfileInitial: Component', () => {
  it('should render user initial', () => {
    const profile = currentUserFactory({
      firstName: 'John',
    });
    render(<ProfileInitial profile={profile} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should render U if user has no name', () => {
    const profile = currentUserFactory({
      firstName: '',
    });
    render(<ProfileInitial profile={profile} />);

    expect(screen.getByText('U')).toBeInTheDocument();
  });
});

describe('formatProfileInitial: helper function', () => {
  it('should return user initial', () => {
    const profile = currentUserFactory({
      firstName: 'John',
    });
    expect(formatProfileInitial(profile)).toEqual('J');
  });

  it('should return U if user has no name', () => {
    const profile = currentUserFactory({
      firstName: '',
    });
    expect(formatProfileInitial(profile)).toEqual('U');
  });
});
