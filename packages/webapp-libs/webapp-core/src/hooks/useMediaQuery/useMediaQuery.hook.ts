import { isNil } from 'ramda';

import { media, useTheme } from '../../theme';

export interface BreakpointQuery {
  below?: media.Breakpoint;
  above?: media.Breakpoint;
  matches?: media.Breakpoint | media.Breakpoint[];
}

interface QueryResult {
  matches: boolean;
}

/**
 * useMediaQuery(\\{above: Breakpoint.DESKTOP}); => true for desktop and above, false otherwise
 * useMediaQuery(\\{below: Breakpoint.DESKTOP}); => true for desktop and below, false otherwise
 * useMediaQuery(\\{matches: Breakpoint.DESKTOP}); => true for desktop, false otherwise
 * useMediaQuery(\\{matches: [Breakpoint.DESKTOP, Breakpoint.MOBILE]}); => true for desktop and mobile, false otherwise
 **/

export const useMediaQuery = ({ above, below, matches }: BreakpointQuery): QueryResult => {
  const theme = useTheme();
  const activeBreakpoint: media.Breakpoint = theme.activeBreakpoint ?? media.Breakpoint.MOBILE;

  const arrayToMatch = Array.isArray(matches) ? matches : [matches];
  const matchesExplicitProp = isNil(matches) || arrayToMatch.includes(activeBreakpoint);

  const matchesAboveProp =
    isNil(above) || media.sizesOrdered.indexOf(activeBreakpoint) >= media.sizesOrdered.indexOf(above);
  const matchesBelowProp =
    isNil(below) || media.sizesOrdered.indexOf(activeBreakpoint) <= media.sizesOrdered.indexOf(below);

  return { matches: matchesExplicitProp && matchesAboveProp && matchesBelowProp };
};
