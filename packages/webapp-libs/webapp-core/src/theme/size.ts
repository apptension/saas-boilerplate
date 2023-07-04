import { css } from 'styled-components';

export const sizeUnitBase = 8;
export const sizeUnits = (size = 1) => size * sizeUnitBase + 'px';

export const horizontalPadding = (value: string) => css`
  padding-left: ${value};
  padding-right: ${value};
`;

export const verticalPadding = (value: string) => css`
  padding-top: ${value};
  padding-bottom: ${value};
`;

export const horizontalMargin = (value: string) => css`
  margin-left: ${value};
  margin-right: ${value};
`;
