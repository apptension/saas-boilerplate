import { useTheme } from 'styled-components';
import { screen, getNodeText } from '@testing-library/react';
import { ResponsiveThemeProvider, ResponsiveThemeProviderProps } from '../responsiveThemeProvider.component';
import { render } from '../../../../tests/utils/rendering';
import { Breakpoint, getActiveBreakpoint } from '../../../../theme/media';

jest.mock('../../../../theme/media');

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

  it('should pass theme to child elements', () => {
    render(<Component />);
    const content = screen.getByTestId('content');
    expect(getNodeText(content)).toEqual(Breakpoint.DESKTOP);
  });
});
