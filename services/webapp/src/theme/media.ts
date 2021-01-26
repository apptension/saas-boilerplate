import { BaseThemedCssFunction, css, DefaultTheme } from 'styled-components';
import { complement, isNil, reverse } from 'ramda';

export enum Breakpoint {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  DESKTOP_WIDE = 'desktopWide',
  DESKTOP_FULL = 'desktopFull',
}

export const sizes: Record<Breakpoint, number> = {
  [Breakpoint.DESKTOP_FULL]: 1920,
  [Breakpoint.DESKTOP_WIDE]: 1440,
  [Breakpoint.DESKTOP]: 1280,
  [Breakpoint.TABLET]: 768,
  [Breakpoint.MOBILE]: 320,
};

export const sizesOrdered = [
  Breakpoint.MOBILE,
  Breakpoint.TABLET,
  Breakpoint.DESKTOP,
  Breakpoint.DESKTOP_WIDE,
  Breakpoint.DESKTOP_FULL,
] as const;

const getWindowWidth = () => window.innerWidth;

export const getBreakpointMediaQuery = (breakpoint: Breakpoint) => `(min-width: ${sizes[breakpoint]}px)`;

export const media = (breakpoint: Breakpoint, opts: { landscape?: boolean; retina?: boolean } = {}) => {
  return ((styleTemplate: TemplateStringsArray) => {
    const joinQuery = (...queries: (string | null)[]) => queries.filter(complement(isNil)).join(' and ');

    const sizeQuery = `(min-width: ${sizes[breakpoint]}px)`;
    const landscapeQuery = opts.landscape ? '(orientation: landscape)' : null;
    const retinaQueries = opts.retina ? ['(-webkit-min-device-pixel-ratio: 2)', '(min-resolution: 192dpi)'] : null;

    let query = '';
    if (retinaQueries) {
      query = retinaQueries.map(retinaQuery => joinQuery(sizeQuery, landscapeQuery, retinaQuery)).join(', ');
    } else {
      query = joinQuery(sizeQuery, landscapeQuery);
    }

    return css`
      @media ${query} {
        ${css(styleTemplate)}
      }
    `;
  }) as BaseThemedCssFunction<DefaultTheme>;
};

export const isMobile = () => {
  const width = getWindowWidth();
  return width < sizes[Breakpoint.TABLET];
};

export const isTablet = () => {
  const width = getWindowWidth();
  return width >= sizes[Breakpoint.TABLET] && width < sizes[Breakpoint.DESKTOP];
};

export const isDesktop = () => {
  const width = getWindowWidth();
  return width >= sizes[Breakpoint.DESKTOP];
};

export const getActiveBreakpoint = () => {
  let breakpoint: Breakpoint = Breakpoint.MOBILE;
  const config: Record<Breakpoint, Breakpoint> = {
    [Breakpoint.DESKTOP_FULL]: Breakpoint.DESKTOP_FULL,
    [Breakpoint.DESKTOP_WIDE]: Breakpoint.DESKTOP_WIDE,
    [Breakpoint.DESKTOP]: Breakpoint.DESKTOP,
    [Breakpoint.TABLET]: Breakpoint.TABLET,
    [Breakpoint.MOBILE]: Breakpoint.MOBILE,
  };

  sizesOrdered.forEach(size => {
    if (config[size] && window.matchMedia(getBreakpointMediaQuery(size)).matches) {
      breakpoint = config[size];
    }
  });

  return breakpoint;
};

export const responsiveValue = <Value>(defaultValue: Value, config: Partial<Record<Breakpoint, Value>> = {}) => ({ theme }: { theme: DefaultTheme }) => {
  const matchesCurrentBreakpoint = (breakpoint: Breakpoint) => sizesOrdered.indexOf(breakpoint) <= sizesOrdered.indexOf(theme.activeBreakpoint ?? Breakpoint.MOBILE);
  const matchingBreakpoint = reverse(sizesOrdered).find(size => config[size] && matchesCurrentBreakpoint(size));
  return matchingBreakpoint ? config[matchingBreakpoint] : defaultValue;
};
