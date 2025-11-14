import { useTheme } from '@sb/webapp-core/hooks/useTheme/useTheme';
import { Themes } from '@sb/webapp-core/providers/themeProvider';
import { useEffect, useRef } from 'react';

import { LogoIcon } from '../../../../images/icons';

export const AuthLogo = () => {
  const { theme } = useTheme();
  const logoColor = theme === Themes.DARK ? 'white' : 'black';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.removeAttribute('height');
        svg.setAttribute('width', '150');
        svg.style.width = '150px';
        svg.style.height = 'auto';
      }
    }
  }, []);

  return (
    <div ref={containerRef} className="my-4 w-[150px]">
      <LogoIcon
        color={logoColor}
        style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
        className="[&>svg]:!h-auto [&>svg]:!w-full"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};
