import styled from 'styled-components';

import { darkModeQuery, emailColors, emailFonts, emailSpacing, mobileQuery } from '../../theme';

/**
 * Data table - hidden on mobile, shown on desktop
 */
export const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${emailSpacing.sm};
  background-color: ${emailColors.background};
  border-radius: 4px;
  overflow: hidden;

  ${darkModeQuery} {
    background-color: ${emailColors.backgroundDarkAlt} !important;
  }

  ${mobileQuery} {
    display: none !important;
  }
`;

export const TableHead = styled.thead`
  background-color: ${emailColors.backgroundAlt};

  ${darkModeQuery} {
    background-color: ${emailColors.backgroundDark} !important;
  }
`;

export const TableBody = styled.tbody``;

export const TableHeader = styled.th<{ $align: 'left' | 'right' }>`
  font-family: ${emailFonts.primary};
  font-size: ${emailFonts.sizeXs};
  font-weight: ${emailFonts.weightSemibold};
  color: ${emailColors.textMuted};
  padding: 12px 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${emailColors.border};
  text-align: ${({ $align }) => $align};

  ${darkModeQuery} {
    color: ${emailColors.textMuted} !important;
    border-bottom-color: ${emailColors.borderDark} !important;
  }
`;

export const TableRow = styled.tr<{ $isEven: boolean }>`
  background-color: ${({ $isEven }) => ($isEven ? emailColors.background : emailColors.backgroundAlt)};

  ${darkModeQuery} {
    background-color: ${({ $isEven }) =>
      $isEven ? emailColors.backgroundDarkAlt : emailColors.backgroundDark} !important;
  }
`;

export const TableCell = styled.td<{ $align: 'left' | 'right'; $isAction?: boolean }>`
  font-family: ${emailFonts.primary};
  font-size: ${emailFonts.sizeSm};
  color: ${emailColors.textPrimary};
  padding: ${({ $isAction }) => ($isAction ? '8px 16px' : '12px 16px')};
  border-bottom: 1px solid ${emailColors.borderLight};
  vertical-align: middle;
  text-align: ${({ $align }) => $align};
  ${({ $isAction }) => $isAction && 'width: 100px;'}

  ${darkModeQuery} {
    color: ${emailColors.textDarkMode} !important;
    border-bottom-color: ${emailColors.borderDark} !important;
  }
`;

/**
 * Mobile card view - shown on mobile, hidden on desktop
 */
export const DataCard = styled.div`
  display: none;
  background-color: ${emailColors.background};
  border: 1px solid ${emailColors.border};
  border-radius: 8px;
  padding: ${emailSpacing.sm};
  margin-bottom: ${emailSpacing.xs};
  text-align: center;

  ${darkModeQuery} {
    background-color: ${emailColors.backgroundDarkAlt} !important;
    border-color: ${emailColors.borderDark} !important;
  }

  ${mobileQuery} {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 12px !important;
  }
`;

export const DataCardEmail = styled.div`
  font-family: ${emailFonts.primary};
  font-size: ${emailFonts.sizeSm};
  font-weight: ${emailFonts.weightMedium};
  color: ${emailColors.textPrimary};
  word-break: break-all;
  text-align: center;

  ${darkModeQuery} {
    color: ${emailColors.textDarkMode} !important;
  }
`;

export const DataCardAction = styled.div`
  display: flex;
  justify-content: center;
`;
