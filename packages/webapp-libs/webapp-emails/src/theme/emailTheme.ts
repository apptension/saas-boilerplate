/**
 * Email-specific theme configuration
 * Uses email-safe colors and spacing that work across email clients
 */

export const emailColors = {
  // Brand colors
  primary: '#0F172A', // Dark slate for buttons
  primaryHover: '#1E293B',
  accent: '#3B82F6', // Blue for links

  // Backgrounds
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',
  backgroundDark: '#1A1A1A',
  backgroundDarkAlt: '#262626',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textLight: '#FFFFFF',
  textDarkMode: '#F1F5F9',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#374151',

  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Social media brand colors
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  instagram: '#E4405F',
  github: '#181717',
};

export const emailSpacing = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  xxl: '64px',
};

export const emailFonts = {
  // Email-safe font stack with fallbacks
  primary: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  // Sizes
  sizeXs: '12px',
  sizeSm: '14px',
  sizeMd: '16px',
  sizeLg: '18px',
  sizeXl: '24px',
  size2xl: '28px',
  size3xl: '32px',
  // Line heights
  lineHeightTight: '1.25',
  lineHeightNormal: '1.5',
  lineHeightRelaxed: '1.75',
  // Weights
  weightNormal: '400',
  weightMedium: '500',
  weightSemibold: '600',
  weightBold: '700',
};

export const emailLayout = {
  maxWidth: '600px',
  borderRadius: '8px',
  borderRadiusSm: '4px',
  borderRadiusLg: '12px',
};

// Dark mode CSS media query
export const darkModeQuery = '@media (prefers-color-scheme: dark)';

// Mobile responsive CSS media query
export const mobileQuery = '@media only screen and (max-width: 600px)';
