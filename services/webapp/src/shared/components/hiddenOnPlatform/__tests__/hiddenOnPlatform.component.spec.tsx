import { screen } from '@testing-library/react';
import { HiddenOnPlatformComponentProps } from '../hiddenOnPlatform.component';
import { HiddenOnPlatform } from '../index';
import { render } from '../../../../tests/utils/rendering';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { Breakpoint } from '../../../../theme/media';

jest.mock('../../../hooks/useMediaQuery');
const mockedUseMediaQuery = useMediaQuery as jest.Mock;

const PLACEHOLDER_TEST_ID = 'content';
const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;

describe('HiddenOnPlatform: Component', () => {
  const defaultQuery = {
    below: Breakpoint.DESKTOP_FULL,
    above: Breakpoint.MOBILE,
    matches: [Breakpoint.TABLET],
  };

  const Component = (props: Partial<HiddenOnPlatformComponentProps> = {}) => (
    <HiddenOnPlatform {...defaultQuery} {...props}>
      {PLACEHOLDER_CONTENT}
    </HiddenOnPlatform>
  );

  beforeEach(() => {
    mockedUseMediaQuery.mockReset();
  });

  it('should pass query to useMediaQuery hook', () => {
    mockedUseMediaQuery.mockReturnValue({ matches: true });
    render(<Component />);
    expect(useMediaQuery).toHaveBeenCalledWith(defaultQuery);
  });

  it('should render nothing if media query matches', () => {
    mockedUseMediaQuery.mockReturnValue({ matches: true });
    render(<Component />);
    expect(screen.queryByTestId(PLACEHOLDER_TEST_ID)).not.toBeInTheDocument();
  });

  it('should render children if media query doesnt match', () => {
    mockedUseMediaQuery.mockReturnValue({ matches: false });
    render(<Component />);
    expect(screen.getByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });
});
