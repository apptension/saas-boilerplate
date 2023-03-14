import { screen } from '@testing-library/react';

import { ResponsiveThemeProvider } from '../../../providers';
import { render } from '../../../tests/utils/rendering';
import { media } from '../../../theme';
import { HiddenOnPlatform, HiddenOnPlatformProps } from '../hiddenOnPlatform.component';

const PLACEHOLDER_TEST_ID = 'content';

describe('HiddenOnPlatform: Component', () => {
  const defaultQuery = {
    below: media.Breakpoint.DESKTOP_FULL,
    above: media.Breakpoint.MOBILE,
    matches: [media.Breakpoint.TABLET],
  };

  const Component = (props: Partial<HiddenOnPlatformProps> = {}) => (
    <HiddenOnPlatform {...defaultQuery} {...props}>
      <span data-testid={PLACEHOLDER_TEST_ID}>content</span>
    </HiddenOnPlatform>
  );

  it('should render nothing if media query matches', async () => {
    render(
      <ResponsiveThemeProvider activeBreakpoint={media.Breakpoint.TABLET}>
        <Component />
      </ResponsiveThemeProvider>
    );
    expect(screen.queryByTestId(PLACEHOLDER_TEST_ID)).not.toBeInTheDocument();
  });

  it('should render children if media query doesnt match', async () => {
    render(
      <ResponsiveThemeProvider activeBreakpoint={media.Breakpoint.DESKTOP}>
        <Component />
      </ResponsiveThemeProvider>
    );
    expect(screen.getByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });
});
