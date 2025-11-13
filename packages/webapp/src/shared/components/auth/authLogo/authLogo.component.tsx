import { LogoIcon } from '../../../../images/icons';
import { useTheme } from '@sb/webapp-core/hooks/useTheme/useTheme';
import { Themes } from '@sb/webapp-core/providers/themeProvider';
import { useEffect, useRef } from 'react';

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
    <div ref={containerRef} className="w-[150px] my-4">
      <LogoIcon
        color={logoColor}
        style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
        className="[&>svg]:!h-auto [&>svg]:!w-full"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

