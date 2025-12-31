import styled, { css } from 'styled-components';

import { darkModeQuery, emailColors, emailFonts, emailSpacing } from '../../theme';

type TextStyleProps = {
  $align: 'left' | 'center' | 'right';
};

const baseTextStyles = css<TextStyleProps>`
  font-family: ${emailFonts.primary};
  margin: 0;
  padding: 0 0 ${emailSpacing.sm} 0;
  text-align: ${({ $align }) => $align};
  line-height: ${emailFonts.lineHeightNormal};
`;

export const Paragraph = styled.p<TextStyleProps>`
  ${baseTextStyles}
  font-size: ${emailFonts.sizeMd};
  font-weight: ${emailFonts.weightNormal};
  color: ${emailColors.textPrimary};

  ${darkModeQuery} {
    color: ${emailColors.textDarkMode} !important;
  }
`;

export const SecondaryText = styled.p<TextStyleProps>`
  ${baseTextStyles}
  font-size: ${emailFonts.sizeMd};
  font-weight: ${emailFonts.weightNormal};
  color: ${emailColors.textSecondary};

  ${darkModeQuery} {
    color: ${emailColors.textMuted} !important;
  }
`;

export const MutedText = styled.p<TextStyleProps>`
  ${baseTextStyles}
  font-size: ${emailFonts.sizeSm};
  font-weight: ${emailFonts.weightNormal};
  color: ${emailColors.textMuted};

  ${darkModeQuery} {
    color: ${emailColors.textMuted} !important;
  }
`;

export const SmallText = styled.p<TextStyleProps>`
  ${baseTextStyles}
  font-size: ${emailFonts.sizeXs};
  font-weight: ${emailFonts.weightNormal};
  color: ${emailColors.textMuted};
  padding-bottom: ${emailSpacing.xs};

  ${darkModeQuery} {
    color: ${emailColors.textMuted} !important;
  }
`;
