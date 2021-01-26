import React from 'react';
import { useTheme } from 'styled-components';
import { screen, getNodeText } from '@testing-library/react';
import { ResponsiveThemeProvider, ResponsiveThemeProviderProps } from '../responsiveThemeProvider.component';
import { makePropsRenderer } from '../../../utils/testUtils';
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
    getActiveBreakpoint.mockReturnValue(Breakpoint.DESKTOP);
  })

  const component = (props: Partial<ResponsiveThemeProviderProps>) => (
    <ResponsiveThemeProvider {...defaultProps} {...props} />
  );

  const render = makePropsRenderer(component);

  it('should pass theme to child elements', () => {
    render();
    const content = screen.getByTestId('content');
    expect(getNodeText(content)).toEqual(Breakpoint.DESKTOP);
  });
});
