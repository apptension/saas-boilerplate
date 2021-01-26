import { isNil } from 'ramda';
import { useTheme } from 'styled-components';
import { Breakpoint, sizesOrdered } from '../../../theme/media';

export interface BreakpointQuery {
  below?: Breakpoint;
  above?: Breakpoint;
  matches?: Breakpoint | Breakpoint[];
}

interface QueryResult {
  matches: boolean;
}

/**
 * useMediaQuery({above=Breakpoint.DESKTOP}); => true for desktop and above, false otherwise
 * useMediaQuery({below=Breakpoint.DESKTOP}); => true for desktop and below, false otherwise
 * useMediaQuery({matches=Breakpoint.DESKTOP}); => true for desktop, false otherwise
 * useMediaQuery({matches=[Breakpoint.DESKTOP, Breakpoint.MOBILE]}); => true for desktop and mobile, false otherwise
 **/
export const useMediaQuery = ({ above, below, matches }: BreakpointQuery): QueryResult => {
  const activeBreakpoint: Breakpoint = useTheme().activeBreakpoint ?? Breakpoint.MOBILE;

  const arrayToMatch = Array.isArray(matches) ? matches : [matches];
  const matchesExplicitProp = isNil(matches) || arrayToMatch.includes(activeBreakpoint);

  const matchesAboveProp = isNil(above) || sizesOrdered.indexOf(activeBreakpoint) >= sizesOrdered.indexOf(above);
  const matchesBelowProp = isNil(below) || sizesOrdered.indexOf(activeBreakpoint) <= sizesOrdered.indexOf(below);

  return { matches: matchesExplicitProp && matchesAboveProp && matchesBelowProp };
};
