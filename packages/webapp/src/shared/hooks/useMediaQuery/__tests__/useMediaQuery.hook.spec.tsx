import { renderHook } from '@testing-library/react-hooks';
import { BreakpointQuery, useMediaQuery } from '../useMediaQuery.hook';
import { Breakpoint, getActiveBreakpoint } from '../../../../theme/media';
import { ResponsiveThemeProvider } from '../../../../app/providers/responsiveThemeProvider';

jest.mock('../../../../theme/media', () => ({
  ...jest.requireActual<NodeModule>('../../../../theme/media'),
  getActiveBreakpoint: jest.fn(),
}));

const render = (query: BreakpointQuery = {}) =>
  renderHook(() => useMediaQuery(query), {
    wrapper: ({ children }) => <ResponsiveThemeProvider>{children}</ResponsiveThemeProvider>,
  });

const mockedGetActiveBreakpoint = getActiveBreakpoint as jest.Mock;

describe('useMediaQuery: Hook', () => {
  it('should return true if no query defined', () => {
    const { result } = render();
    expect(result.current).toEqual({ matches: true });
  });

  describe('when matches props is specified', () => {
    it("should return false when given breakPoint name doesn't match current breakPoint", () => {
      mockedGetActiveBreakpoint.mockReturnValue(Breakpoint.TABLET);
      const { result } = render({ matches: Breakpoint.MOBILE });
      expect(result.current).toEqual({ matches: false });
    });

    it('should return true when given breakPoint name matches current breakPoint', () => {
      mockedGetActiveBreakpoint.mockReturnValue(Breakpoint.MOBILE);
      const { result } = render({ matches: Breakpoint.MOBILE });
      expect(result.current).toEqual({ matches: true });
    });
  });

  describe('when below prop is specified', () => {
    it('should return true if active breakpoint is smaller', () => {
      mockedGetActiveBreakpoint.mockReturnValue(Breakpoint.TABLET);
      const { result } = render({ below: Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: true });
    });

    it('should return true if active breakpoint is equal', () => {
      mockedGetActiveBreakpoint.mockReturnValue(Breakpoint.DESKTOP);
      const { result } = render({ below: Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: true });
    });

    it('should return false if active breakpoint larger', () => {
      mockedGetActiveBreakpoint.mockReturnValue(Breakpoint.DESKTOP_FULL);
      const { result } = render({ below: Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: false });
    });
  });

  describe('when above prop is specified', () => {
    it('should return false if active breakpoint is smaller', () => {
      mockedGetActiveBreakpoint.mockReturnValue(Breakpoint.TABLET);
      const { result } = render({ above: Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: false });
    });

    it('should return true if active breakpoint is equal', () => {
      mockedGetActiveBreakpoint.mockReturnValue(Breakpoint.DESKTOP);
      const { result } = render({ above: Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: true });
    });

    it('should return true if active breakpoint is larger', () => {
      mockedGetActiveBreakpoint.mockReturnValue(Breakpoint.DESKTOP_FULL);
      const { result } = render({ above: Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: true });
    });
  });
});
