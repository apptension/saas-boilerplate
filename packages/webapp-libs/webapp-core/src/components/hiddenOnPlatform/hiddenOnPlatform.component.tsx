import { ReactNode } from 'react';

import { useMediaQuery } from '../../hooks';
import { media } from '../../theme';

export type HiddenOnPlatformProps = {
  children?: ReactNode;
  below?: media.Breakpoint;
  above?: media.Breakpoint;
  matches?: media.Breakpoint | media.Breakpoint[];
};

/**
 * Usage:
 * <HiddenOnPlatform above={Breakpoint.DESKTOP}>...</HiddenOnPlatform> - will not render children for desktop and above
 * <HiddenOnPlatform below={Breakpoint.DESKTOP}>...</HiddenOnPlatform> - will not render children for desktop and below
 * <HiddenOnPlatform matches={Breakpoint.DESKTOP}>...</HiddenOnPlatform> - will not render children for desktop
 * <HiddenOnPlatform matches={[Breakpoint.DESKTOP, Breakpoint.MOBILE]}>...</HiddenOnPlatform> - will not render children for desktop & mobile
 **/
export const HiddenOnPlatform = ({ children, below, above, matches }: HiddenOnPlatformProps) => {
  const { matches: shouldHide } = useMediaQuery({ above, below, matches });
  return <>{shouldHide ? null : children}</>;
};
