import React from 'react';
import { screen } from '@testing-library/react';
import { HiddenOnPlatformComponentProps } from '../hiddenOnPlatform.component';
import { HiddenOnPlatform } from '../index';
import { makePropsRenderer, PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID } from '../../../utils/testUtils';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { Breakpoint } from '../../../../theme/media';

jest.mock('../../../hooks/useMediaQuery');

describe('HiddenOnPlatform: Component', () => {
  const defaultQuery = {
    below: Breakpoint.DESKTOP_FULL,
    above: Breakpoint.MOBILE,
    matches: [Breakpoint.TABLET],
  };

  const component = (props: Partial<HiddenOnPlatformComponentProps> = {}) => (
    <HiddenOnPlatform {...defaultQuery} {...props}>
      {PLACEHOLDER_CONTENT}
    </HiddenOnPlatform>
  );

  const render = makePropsRenderer(component);

  beforeEach(() => {
    useMediaQuery.mockReset();
  });

  it('should pass query to useMediaQuery hook', () => {
    useMediaQuery.mockReturnValue({ matches: true });
    render();
    expect(useMediaQuery).toHaveBeenCalledWith(defaultQuery);
  });

  it('should render nothing if media query matches', () => {
    useMediaQuery.mockReturnValue({ matches: true });
    render();
    expect(screen.queryByTestId(PLACEHOLDER_TEST_ID)).not.toBeInTheDocument();
  });

  it('should render children if media query doesnt match', () => {
    useMediaQuery.mockReturnValue({ matches: false });
    render();
    expect(screen.queryByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });
});
