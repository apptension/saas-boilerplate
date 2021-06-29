import { ReactNode } from 'react';
import { Breakpoint } from '../../../theme/media';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export type HiddenOnPlatformComponentProps = {
  children?: ReactNode;
  below?: Breakpoint;
  above?: Breakpoint;
  matches?: Breakpoint | Breakpoint[];
};

/**
 * Usage:
 * <HiddenOnPlatform above={Breakpoint.DESKTOP}>...</HiddenOnPlatform> - will not render children for desktop and above
 * <HiddenOnPlatform below={Breakpoint.DESKTOP}>...</HiddenOnPlatform> - will not render children for desktop and below
 * <HiddenOnPlatform matches={Breakpoint.DESKTOP}>...</HiddenOnPlatform> - will not render children for desktop
 * <HiddenOnPlatform matches={[Breakpoint.DESKTOP, Breakpoint.MOBILE]}>...</HiddenOnPlatform> - will not render children for desktop & mobile
 **/
export const HiddenOnPlatformComponent = ({ children, below, above, matches }: HiddenOnPlatformComponentProps) => {
  const { matches: shouldHide } = useMediaQuery({ above, below, matches });
  return shouldHide ? null : <>{children}</>;
};
