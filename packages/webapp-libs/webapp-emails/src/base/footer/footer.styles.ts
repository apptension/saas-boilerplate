import styled from 'styled-components';

import { darkModeQuery, emailColors, emailFonts, emailSpacing, mobileQuery } from '../../theme';
import { Table, Td, Tr } from '../base.styles';

export const Container = styled.div`
  background-color: ${emailColors.backgroundAlt};
  padding: ${emailSpacing.lg} ${emailSpacing.md};
  border-top: 1px solid ${emailColors.border};
  margin-top: ${emailSpacing.lg};

  ${darkModeQuery} {
    background-color: ${emailColors.backgroundDarkAlt} !important;
    border-top-color: ${emailColors.borderDark} !important;
  }

  ${mobileQuery} {
    padding: ${emailSpacing.md} ${emailSpacing.sm} !important;
  }
`;

export const FooterTable = styled(Table)`
  text-align: center;
`;

export const FooterTr = styled(Tr)``;

export const FooterTd = styled(Td)`
  padding: ${emailSpacing.xs} 0;
  text-align: center;
`;

export const SocialLinksContainer = styled.div`
  display: inline-block;
  margin-bottom: ${emailSpacing.sm};
`;

export const SocialLink = styled.a`
  display: inline-block;
  margin: 0 ${emailSpacing.xs};
  font-family: ${emailFonts.primary};
  font-size: ${emailFonts.sizeSm};
  font-weight: ${emailFonts.weightMedium};
  color: ${emailColors.textSecondary};
  text-decoration: none;

  &:hover {
    color: ${emailColors.accent};
  }

  ${darkModeQuery} {
    color: ${emailColors.textMuted} !important;
  }
`;

export const LegalText = styled.p`
  font-family: ${emailFonts.primary};
  font-size: ${emailFonts.sizeXs};
  line-height: ${emailFonts.lineHeightNormal};
  color: ${emailColors.textMuted};
  margin: 0;
  padding: ${emailSpacing.xs} 0;

  ${darkModeQuery} {
    color: ${emailColors.textMuted} !important;
  }
`;

export const TextLink = styled.a`
  color: ${emailColors.textSecondary};
  text-decoration: underline;

  &:hover {
    color: ${emailColors.accent};
  }

  ${darkModeQuery} {
    color: ${emailColors.textMuted} !important;
  }
`;

export const LinkSeparator = styled.span`
  margin: 0 ${emailSpacing.xs};
  color: ${emailColors.textMuted};
`;
