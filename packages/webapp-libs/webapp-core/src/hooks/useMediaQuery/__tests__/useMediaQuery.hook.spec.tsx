import { renderHook } from '@testing-library/react';

import { ResponsiveThemeProvider } from '../../../providers';
import { media } from '../../../theme';
import { BreakpointQuery, useMediaQuery } from '../useMediaQuery.hook';

jest.mock('../../../theme', () => {
  const requireActual = jest.requireActual('../../../theme');
  return {
    ...requireActual,
    media: {
      ...requireActual.media,
      getActiveBreakpoint: jest.fn(),
    },
  };
});

const render = (query: BreakpointQuery = {}) =>
  renderHook(() => useMediaQuery(query), {
    wrapper: ({ children }) => <ResponsiveThemeProvider>{children}</ResponsiveThemeProvider>,
  });

const mockedGetActiveBreakpoint = media.getActiveBreakpoint as jest.Mock;

describe('useMediaQuery: Hook', () => {
  it('should return true if no query defined', () => {
    const { result } = render();
    expect(result.current).toEqual({ matches: true });
  });

  describe('when matches props is specified', () => {
    it("should return false when given breakPoint name doesn't match current breakPoint", () => {
      mockedGetActiveBreakpoint.mockReturnValue(media.Breakpoint.TABLET);
      const { result } = render({ matches: media.Breakpoint.MOBILE });
      expect(result.current).toEqual({ matches: false });
    });

    it('should return true when given breakPoint name matches current breakPoint', () => {
      mockedGetActiveBreakpoint.mockReturnValue(media.Breakpoint.MOBILE);
      const { result } = render({ matches: media.Breakpoint.MOBILE });
      expect(result.current).toEqual({ matches: true });
    });
  });

  describe('when below prop is specified', () => {
    it('should return true if active breakpoint is smaller', () => {
      mockedGetActiveBreakpoint.mockReturnValue(media.Breakpoint.TABLET);
      const { result } = render({ below: media.Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: true });
    });

    it('should return true if active breakpoint is equal', () => {
      mockedGetActiveBreakpoint.mockReturnValue(media.Breakpoint.DESKTOP);
      const { result } = render({ below: media.Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: true });
    });

    it('should return false if active breakpoint larger', () => {
      mockedGetActiveBreakpoint.mockReturnValue(media.Breakpoint.DESKTOP_FULL);
      const { result } = render({ below: media.Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: false });
    });
  });

  describe('when above prop is specified', () => {
    it('should return false if active breakpoint is smaller', () => {
      mockedGetActiveBreakpoint.mockReturnValue(media.Breakpoint.TABLET);
      const { result } = render({ above: media.Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: false });
    });

    it('should return true if active breakpoint is equal', () => {
      mockedGetActiveBreakpoint.mockReturnValue(media.Breakpoint.DESKTOP);
      const { result } = render({ above: media.Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: true });
    });

    it('should return true if active breakpoint is larger', () => {
      mockedGetActiveBreakpoint.mockReturnValue(media.Breakpoint.DESKTOP_FULL);
      const { result } = render({ above: media.Breakpoint.DESKTOP });
      expect(result.current).toEqual({ matches: true });
    });
  });
});
