import styled, { css } from 'styled-components';

import { darkModeQuery, emailColors, emailFonts, emailLayout, emailSpacing, mobileQuery } from '../../theme';
import { ButtonVariant } from './button.component';

/**
 * Bulletproof button table wrapper
 * Using table layout for maximum email client compatibility
 */
export const ButtonTableWrapper = styled.table<{ $fullWidth: boolean }>`
  border-collapse: separate !important;
  border-spacing: 0;
  margin: ${emailSpacing.sm} auto;
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}

  ${mobileQuery} {
    width: 100% !important;
  }
`;

const variantBackgrounds = {
  primary: emailColors.primary,
  secondary: emailColors.backgroundAlt,
  outline: 'transparent',
};

export const ButtonTableCell = styled.td<{ $variant: ButtonVariant }>`
  border-radius: ${emailLayout.borderRadiusSm};
  background-color: ${({ $variant }) => variantBackgrounds[$variant]};
  text-align: center;

  ${darkModeQuery} {
    background-color: ${({ $variant }) =>
      $variant === 'primary' ? emailColors.accent : emailColors.backgroundDarkAlt} !important;
  }
`;

const baseLinkStyles = css`
  font-family: ${emailFonts.primary};
  font-size: ${emailFonts.sizeSm};
  font-weight: ${emailFonts.weightSemibold};
  line-height: ${emailFonts.lineHeightNormal};
  text-decoration: none;
  display: inline-block;
  padding: 12px 24px;
  border-radius: ${emailLayout.borderRadiusSm};
  box-sizing: border-box;

  ${mobileQuery} {
    display: block !important;
    width: 100% !important;
    padding: 14px 20px !important;
    /* Minimum touch target size for mobile */
    min-height: 44px;
  }
`;

export const ButtonLink = styled.a`
  ${baseLinkStyles}
  color: ${emailColors.textLight};
  background-color: ${emailColors.primary};
  border: 2px solid ${emailColors.primary};

  ${darkModeQuery} {
    color: ${emailColors.textLight} !important;
    background-color: ${emailColors.accent} !important;
    border-color: ${emailColors.accent} !important;
  }
`;

export const SecondaryButtonLink = styled.a`
  ${baseLinkStyles}
  color: ${emailColors.textPrimary};
  background-color: ${emailColors.backgroundAlt};
  border: 2px solid ${emailColors.border};

  ${darkModeQuery} {
    color: ${emailColors.textDarkMode} !important;
    background-color: ${emailColors.backgroundDarkAlt} !important;
    border-color: ${emailColors.borderDark} !important;
  }
`;

export const OutlineButtonLink = styled.a`
  ${baseLinkStyles}
  color: ${emailColors.primary};
  background-color: transparent;
  border: 2px solid ${emailColors.primary};

  ${darkModeQuery} {
    color: ${emailColors.accent} !important;
    border-color: ${emailColors.accent} !important;
  }
`;

/**
 * Inline button styles - compact buttons for use inside data tables
 */
const inlineLinkStyles = css`
  font-family: ${emailFonts.primary};
  font-size: ${emailFonts.sizeXs};
  font-weight: ${emailFonts.weightSemibold};
  line-height: 1;
  text-decoration: none;
  display: inline-block;
  padding: 8px 12px;
  border-radius: ${emailLayout.borderRadiusSm};
  box-sizing: border-box;
  white-space: nowrap;
`;

export const InlineButtonLink = styled.a`
  ${inlineLinkStyles}
  color: ${emailColors.textLight};
  background-color: ${emailColors.primary};
  border: 1px solid ${emailColors.primary};

  ${darkModeQuery} {
    color: ${emailColors.textLight} !important;
    background-color: ${emailColors.accent} !important;
    border-color: ${emailColors.accent} !important;
  }
`;

export const InlineSecondaryButtonLink = styled.a`
  ${inlineLinkStyles}
  color: ${emailColors.textPrimary};
  background-color: ${emailColors.backgroundAlt};
  border: 1px solid ${emailColors.border};

  ${darkModeQuery} {
    color: ${emailColors.textDarkMode} !important;
    background-color: ${emailColors.backgroundDarkAlt} !important;
    border-color: ${emailColors.borderDark} !important;
  }
`;

export const InlineOutlineButtonLink = styled.a`
  ${inlineLinkStyles}
  color: ${emailColors.primary};
  background-color: transparent;
  border: 1px solid ${emailColors.primary};

  ${darkModeQuery} {
    color: ${emailColors.accent} !important;
    border-color: ${emailColors.accent} !important;
  }
`;

// Legacy export for backward compatibility
export const Container = ButtonLink;
