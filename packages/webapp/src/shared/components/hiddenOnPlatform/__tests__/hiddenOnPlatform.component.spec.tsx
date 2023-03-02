import { screen } from '@testing-library/react';

import { render } from '../../../../tests/utils/rendering';
import { Breakpoint } from '../../../../theme/media';
import { useMediaQuery } from '../../../hooks';
import { HiddenOnPlatformComponentProps } from '../hiddenOnPlatform.component';
import { HiddenOnPlatform } from '../index';

jest.mock('../../../hooks/useMediaQuery');
const mockedUseMediaQuery = useMediaQuery as jest.Mock;

const PLACEHOLDER_TEST_ID = 'content';
const PLACEHOLDER_CONTENT = <span data-testid={PLACEHOLDER_TEST_ID}>content</span>;

describe('HiddenOnPlatform: Component', () => {
  const defaultQuery = {
    below: Breakpoint.DESKTOP_FULL,
    above: Breakpoint.MOBILE,
    matches: [Breakpoint.TABLET],
  };

  const Component = (props: Partial<HiddenOnPlatformComponentProps> = {}) => (
    <HiddenOnPlatform {...defaultQuery} {...props}>
      <>{PLACEHOLDER_CONTENT}</>
    </HiddenOnPlatform>
  );

  beforeEach(() => {
    mockedUseMediaQuery.mockReset();
  });

  it('should pass query to useMediaQuery hook', async () => {
    mockedUseMediaQuery.mockReturnValue({ matches: true });
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    expect(useMediaQuery).toHaveBeenCalledWith(defaultQuery);
  });

  it('should render nothing if media query matches', async () => {
    mockedUseMediaQuery.mockReturnValue({ matches: true });
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    expect(screen.queryByTestId(PLACEHOLDER_TEST_ID)).not.toBeInTheDocument();
  });

  it('should render children if media query doesnt match', async () => {
    mockedUseMediaQuery.mockReturnValue({ matches: false });
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    expect(screen.getByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });
});
