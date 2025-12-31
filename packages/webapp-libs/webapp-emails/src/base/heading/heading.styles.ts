import styled, { css } from 'styled-components';

import { darkModeQuery, emailColors, emailFonts, emailSpacing, mobileQuery } from '../../theme';

type HeadingStyleProps = {
  $align: 'left' | 'center' | 'right';
};

const baseHeadingStyles = css<HeadingStyleProps>`
  font-family: ${emailFonts.primary};
  font-weight: ${emailFonts.weightBold};
  color: ${emailColors.textPrimary};
  margin: 0;
  padding: 0 0 ${emailSpacing.sm} 0;
  text-align: ${({ $align }) => $align};
  line-height: ${emailFonts.lineHeightTight};

  ${darkModeQuery} {
    color: ${emailColors.textDarkMode} !important;
  }
`;

export const H1 = styled.h1<HeadingStyleProps>`
  ${baseHeadingStyles}
  font-size: ${emailFonts.size3xl};

  ${mobileQuery} {
    font-size: ${emailFonts.size2xl} !important;
  }
`;

export const H2 = styled.h2<HeadingStyleProps>`
  ${baseHeadingStyles}
  font-size: ${emailFonts.size2xl};

  ${mobileQuery} {
    font-size: ${emailFonts.sizeXl} !important;
  }
`;

export const H3 = styled.h3<HeadingStyleProps>`
  ${baseHeadingStyles}
  font-size: ${emailFonts.sizeXl};

  ${mobileQuery} {
    font-size: ${emailFonts.sizeLg} !important;
  }
`;

export const H4 = styled.h4<HeadingStyleProps>`
  ${baseHeadingStyles}
  font-size: ${emailFonts.sizeLg};
  font-weight: ${emailFonts.weightSemibold};

  ${mobileQuery} {
    font-size: ${emailFonts.sizeMd} !important;
  }
`;
