import { getNodeText, screen } from '@testing-library/react';
import { useTheme } from 'styled-components';

import { media } from '../../../theme';
import { render } from '../../../tests/utils/rendering';
import {
  ResponsiveThemeProvider,
  ResponsiveThemeProviderProps,
} from '../responsiveThemeProvider.component';

jest.mock('../../../theme', () => {
  const requireActual = jest.requireActual(
    '../../../theme'
  );
  return {
    ...requireActual,
    media: {
      ...requireActual.media,
      getActiveBreakpoint: jest.fn(),
    },
  };
});

const ThemeConsumer = () => {
  const theme = useTheme();
  return <div data-testid="content">{theme.activeBreakpoint}</div>;
};

describe('ResponsiveThemeProvider: Component', () => {
  const defaultProps = {
    children: <ThemeConsumer />,
  };

  beforeEach(() => {
    (media.getActiveBreakpoint as jest.Mock).mockReturnValue(
      media.Breakpoint.DESKTOP
    );
  });

  const Component = (props: Partial<ResponsiveThemeProviderProps>) => (
    <ResponsiveThemeProvider {...defaultProps} {...props} />
  );

  it('should pass theme to child elements', async () => {
    render(<Component />);
    const content = await screen.findByTestId('content');
    expect(getNodeText(content)).toEqual(media.Breakpoint.DESKTOP);
  });
});
