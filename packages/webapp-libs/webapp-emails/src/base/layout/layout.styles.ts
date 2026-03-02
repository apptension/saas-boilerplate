import styled from 'styled-components';

import { darkModeQuery, emailColors, emailFonts, emailLayout, emailSpacing, mobileQuery } from '../../theme';
import { injectedFonts, Table } from '../base.styles';

/**
 * Outer wrapper for the entire email
 * Sets up base styles and dark mode background
 */
export const OuterWrapper = styled.div`
  ${injectedFonts};
  width: 100%;
  background-color: ${emailColors.backgroundAlt};
  padding: ${emailSpacing.lg} 0;
  margin: 0;

  ${darkModeQuery} {
    background-color: ${emailColors.backgroundDark} !important;
  }
`;

/**
 * Main container that holds the email content
 * Centered with max-width for consistent display
 */
export const Container = styled.div`
  max-width: ${emailLayout.maxWidth};
  margin: 0 auto;
  background-color: ${emailColors.background};
  border-radius: ${emailLayout.borderRadius};
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

  ${darkModeQuery} {
    background-color: ${emailColors.backgroundDarkAlt} !important;
  }

  ${mobileQuery} {
    margin: 0 ${emailSpacing.sm} !important;
    border-radius: ${emailLayout.borderRadius} !important;
  }
`;

/**
 * Main table for email structure
 * Uses table layout for email client compatibility
 */
export const MainTable = styled(Table)`
  width: 100%;
  text-align: center;
`;

/**
 * Header section with logo and optional tagline
 */
export const HeaderSection = styled.td`
  padding: ${emailSpacing.lg} ${emailSpacing.md} ${emailSpacing.md};
  text-align: center;
  background-color: ${emailColors.background};

  ${darkModeQuery} {
    background-color: ${emailColors.backgroundDarkAlt} !important;
  }

  ${mobileQuery} {
    padding: ${emailSpacing.md} ${emailSpacing.sm} !important;
  }
`;

/**
 * Logo container
 */
export const LogoContainer = styled.div`
  display: block;
  margin: 0 auto ${emailSpacing.sm};
`;

/**
 * Tagline text under logo
 */
export const Tagline = styled.p`
  font-family: ${emailFonts.primary};
  font-size: ${emailFonts.sizeSm};
  font-weight: ${emailFonts.weightMedium};
  color: ${emailColors.textSecondary};
  margin: 0;
  padding: 0;

  ${darkModeQuery} {
    color: ${emailColors.textMuted} !important;
  }
`;

/**
 * Content cell for main body
 */
export const ContentCell = styled.td`
  padding: ${emailSpacing.sm} ${emailSpacing.lg} ${emailSpacing.lg};

  ${mobileQuery} {
    padding: ${emailSpacing.sm} ${emailSpacing.md} ${emailSpacing.md} !important;
  }
`;

/**
 * Body content wrapper
 */
export const BodyContent = styled.div`
  text-align: center;
`;

// Legacy exports for backward compatibility
export { Table, Td, Tr } from '../base.styles';
export const Title = styled.td`
  font-family: ${emailFonts.primary};
  font-size: ${emailFonts.size2xl};
  font-weight: ${emailFonts.weightBold};
  color: ${emailColors.textPrimary};
  padding-bottom: ${emailSpacing.sm};
  text-align: center;

  ${darkModeQuery} {
    color: ${emailColors.textDarkMode} !important;
  }
`;

export const Text = styled.td`
  font-family: ${emailFonts.primary};
  font-size: ${emailFonts.sizeMd};
  color: ${emailColors.textSecondary};
  padding-bottom: ${emailSpacing.md};
  text-align: center;
  line-height: ${emailFonts.lineHeightNormal};

  ${darkModeQuery} {
    color: ${emailColors.textMuted} !important;
  }
`;
