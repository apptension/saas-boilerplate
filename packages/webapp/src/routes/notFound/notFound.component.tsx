import { Link } from '@sb/webapp-core/components/buttons';
import { cn } from '@sb/webapp-core/lib/utils';
import { ArrowLeft, Home } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

// Falling pixel particle
const FallingPixel = ({
  delay,
  startX,
  startY,
  color,
}: {
  delay: number;
  startX: number;
  startY: number;
  color: 'primary' | 'foreground';
}) => (
  <div
    className={cn(
      'absolute h-1 w-1 sm:h-1.5 sm:w-1.5',
      color === 'primary' ? 'bg-primary' : 'bg-foreground'
    )}
    style={{
      left: `${startX}%`,
      top: `${startY}%`,
      animation: `pixel-fall 2.5s ease-in infinite`,
      animationDelay: `${delay}s`,
      imageRendering: 'pixelated',
    }}
  />
);

// Glitch slice component
const GlitchSlice = ({
  children,
  offset,
  clipY,
  color,
  delay,
}: {
  children: React.ReactNode;
  offset: number;
  clipY: [number, number];
  color: string;
  delay: number;
}) => (
  <div
    className={cn('absolute inset-0 opacity-70', color)}
    style={{
      clipPath: `inset(${clipY[0]}% 0 ${clipY[1]}% 0)`,
      animation: `glitch-slice 3s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      ['--glitch-offset' as string]: `${offset}px`,
    }}
  >
    {children}
  </div>
);

// Epic pixel art "404" with destruction effect
const Pixel404Destructed = ({ className }: { className?: string }) => {
  const [glitchFrame, setGlitchFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchFrame((prev) => (prev + 1) % 4);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Generate falling pixels
  const fallingPixels = useMemo(
    () =>
      [...Array(24)].map((_, i) => ({
        id: i,
        delay: Math.random() * 3,
        startX: 20 + Math.random() * 60,
        startY: 30 + Math.random() * 20,
        color: (Math.random() > 0.5 ? 'primary' : 'foreground') as 'primary' | 'foreground',
      })),
    []
  );

  // Pixel grid for the numbers (simplified representation)
  const renderPixelNumber = (number: '4' | '0', offsetX: number, isPrimary: boolean) => {
    const pixels: { x: number; y: number; opacity?: number }[] = [];
    const baseClass = isPrimary ? 'fill-primary' : 'fill-foreground';

    if (number === '4') {
      // Vertical left
      for (let y = 0; y < 12; y++) pixels.push({ x: 0, y });
      // Vertical right (full height)
      for (let y = 0; y < 20; y++) pixels.push({ x: 10, y });
      // Horizontal bar
      for (let x = 0; x <= 10; x++) pixels.push({ x, y: 9 });
      // Some "broken" pixels falling off
      if (glitchFrame % 2 === 0) {
        pixels.push({ x: 0, y: 12, opacity: 0.5 });
        pixels.push({ x: 10, y: 20, opacity: 0.3 });
      }
    } else {
      // Top
      for (let x = 3; x <= 8; x++) pixels.push({ x, y: 0 });
      // Bottom
      for (let x = 3; x <= 8; x++) pixels.push({ x, y: 19 });
      // Left side
      for (let y = 1; y < 19; y++) pixels.push({ x: 0, y });
      // Right side
      for (let y = 1; y < 19; y++) pixels.push({ x: 11, y });
      // Inner cutout - don't render these
    }

    return (
      <g transform={`translate(${offsetX}, 0)`}>
        {pixels.map((p, i) => (
          <rect
            key={i}
            x={p.x * 3}
            y={p.y * 3}
            width={3}
            height={3}
            className={baseClass}
            opacity={p.opacity ?? 1}
            style={{
              animation:
                Math.random() > 0.9 ? `pixel-shake 0.1s ease-in-out infinite` : undefined,
            }}
          />
        ))}
      </g>
    );
  };

  return (
    <div className={cn('relative', className)}>
      {/* Falling pixels effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {fallingPixels.map((pixel) => (
          <FallingPixel
            key={pixel.id}
            delay={pixel.delay}
            startX={pixel.startX}
            startY={pixel.startY}
            color={pixel.color}
          />
        ))}
      </div>

      {/* Main 404 with glitch layers */}
      <div className="relative">
        {/* RGB split layers */}
        <GlitchSlice offset={-4} clipY={[0, 70]} color="text-primary/50" delay={0}>
          <svg
            viewBox="0 0 156 60"
            className="h-16 w-40 sm:h-24 sm:w-60 md:h-32 md:w-80"
            style={{ imageRendering: 'pixelated' }}
          >
            {renderPixelNumber('4', 0, false)}
            {renderPixelNumber('0', 54, true)}
            {renderPixelNumber('4', 114, false)}
          </svg>
        </GlitchSlice>

        <GlitchSlice offset={4} clipY={[60, 0]} color="text-destructive/50" delay={0.05}>
          <svg
            viewBox="0 0 156 60"
            className="h-16 w-40 sm:h-24 sm:w-60 md:h-32 md:w-80"
            style={{ imageRendering: 'pixelated' }}
          >
            {renderPixelNumber('4', 0, false)}
            {renderPixelNumber('0', 54, true)}
            {renderPixelNumber('4', 114, false)}
          </svg>
        </GlitchSlice>

        {/* Main layer */}
        <svg
          viewBox="0 0 156 60"
          className="relative h-16 w-40 sm:h-24 sm:w-60 md:h-32 md:w-80"
          style={{ imageRendering: 'pixelated' }}
        >
          {renderPixelNumber('4', 0, false)}
          {renderPixelNumber('0', 54, true)}
          {renderPixelNumber('4', 114, false)}

          {/* Corruption lines */}
          <rect
            x="0"
            y={12 + (glitchFrame % 3) * 6}
            width="156"
            height="3"
            className="fill-background/80"
            style={{
              animation: 'scanline-move 0.5s steps(3) infinite',
            }}
          />
        </svg>

        {/* Static noise overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            animation: 'noise-shift 0.2s steps(2) infinite',
          }}
        />
      </div>

    </div>
  );
};

// Glitch text effect
const GlitchText = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={cn('relative inline-block', className)}>
      <span className={cn('relative', glitch && 'animate-glitch')}>{children}</span>
      {glitch && (
        <>
          <span
            className="absolute left-0 top-0 text-primary opacity-70"
            style={{ clipPath: 'inset(20% 0 40% 0)', transform: 'translateX(-3px)' }}
          >
            {children}
          </span>
          <span
            className="absolute left-0 top-0 text-destructive opacity-70"
            style={{ clipPath: 'inset(60% 0 10% 0)', transform: 'translateX(3px)' }}
          >
            {children}
          </span>
        </>
      )}
    </span>
  );
};

export const NotFound = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="relative flex min-h-[calc(100vh-theme(spacing.16)-theme(spacing.20))] w-full flex-col items-center justify-center overflow-hidden px-4 py-8">
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Page Not Found',
          id: 'Not found / page title',
        })}
      />

      {/* Scanline effect */}
      <div
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.02]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
          backgroundSize: '100% 4px',
          animation: 'scanline-scroll 8s linear infinite',
        }}
      />

      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Epic 404 with destruction effect */}
        <div className="mb-8 sm:mb-12">
          <Pixel404Destructed />
        </div>

        {/* Message */}
        <div className="mb-6 max-w-sm space-y-3 sm:mb-8 sm:max-w-md">
          <h1 className="font-mono text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
            <GlitchText>
              <FormattedMessage defaultMessage="PAGE NOT FOUND" id="Not found / headline" />
            </GlitchText>
          </h1>
          <p className="font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm">
            <FormattedMessage
              defaultMessage="This page has been corrupted or doesn't exist. The data you're looking for has been lost in transmission."
              id="Not found / description"
            />
          </p>
        </div>

        {/* Action buttons - pixel art style */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={handleGoBack}
            className={cn(
              'relative inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-background px-4 py-2 font-mono text-xs font-medium text-foreground sm:text-sm',
              'shadow-[4px_4px_0px_0px] shadow-foreground/30',
              'transition-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] hover:shadow-foreground/30',
              'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <FormattedMessage defaultMessage="Go back" id="Not found / go back button" />
          </button>
          <Link
            to="/"
            className={cn(
              'relative inline-flex items-center gap-2 rounded-none border-2 border-primary bg-primary px-4 py-2 font-mono text-xs font-medium text-primary-foreground no-underline sm:text-sm',
              'shadow-[4px_4px_0px_0px] shadow-primary/50',
              'transition-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] hover:shadow-primary/50 hover:no-underline',
              'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
            )}
          >
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <FormattedMessage defaultMessage="Home" id="Not found / home button" />
          </Link>
        </div>

        {/* Error code badge */}
        <div className="mt-8 inline-flex items-center gap-2 rounded border border-border/50 bg-muted/30 px-3 py-1.5 font-mono text-[10px] text-muted-foreground backdrop-blur-sm sm:mt-10 sm:px-4 sm:py-2 sm:text-xs">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-destructive sm:h-2 sm:w-2" />
          <span>
            <FormattedMessage defaultMessage="ERROR_CODE: 404 | STATUS: PAGE_MISSING" id="Not found / error code" />
          </span>
        </div>
      </div>

      {/* Inline styles for custom animations */}
      <style>{`
        @keyframes pixel-fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(120px) rotate(90deg);
          }
        }
        
        @keyframes glitch-slice {
          0%, 90%, 100% {
            transform: translateX(0);
          }
          92% {
            transform: translateX(var(--glitch-offset, 4px));
          }
          94% {
            transform: translateX(calc(var(--glitch-offset, 4px) * -0.5));
          }
          96% {
            transform: translateX(var(--glitch-offset, 4px));
          }
          98% {
            transform: translateX(0);
          }
        }
        
        @keyframes pixel-shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-1px, 1px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, -1px); }
        }
        
        @keyframes scanline-move {
          0% { opacity: 0.8; }
          50% { opacity: 0.4; }
          100% { opacity: 0.8; }
        }
        
        @keyframes scanline-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes noise-shift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-5%, -5%); }
          100% { transform: translate(5%, 5%); }
        }
      `}</style>
    </div>
  );
};
