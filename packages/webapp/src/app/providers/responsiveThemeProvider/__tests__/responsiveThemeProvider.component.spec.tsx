import { getNodeText, screen } from '@testing-library/react';
import { useTheme } from 'styled-components';

import { render } from '../../../../tests/utils/rendering';
import { Breakpoint, getActiveBreakpoint } from '../../../../theme/media';
import { ResponsiveThemeProvider, ResponsiveThemeProviderProps } from '../responsiveThemeProvider.component';

jest.mock('../../../../theme/media', () => ({
  ...jest.requireActual('../../../../theme/media'),
  getActiveBreakpoint: jest.fn(),
}));

const ThemeConsumer = () => {
  const theme = useTheme();
  return <div data-testid="content">{theme.activeBreakpoint}</div>;
};

describe('ResponsiveThemeProvider: Component', () => {
  const defaultProps = {
    children: <ThemeConsumer />,
  };

  beforeEach(() => {
    (getActiveBreakpoint as jest.Mock).mockReturnValue(Breakpoint.DESKTOP);
  });

  const Component = (props: Partial<ResponsiveThemeProviderProps>) => (
    <ResponsiveThemeProvider {...defaultProps} {...props} />
  );

  it('should pass theme to child elements', async () => {
    render(<Component />);
    const content = await screen.findByTestId('content');
    expect(getNodeText(content)).toEqual(Breakpoint.DESKTOP);
  });
});
