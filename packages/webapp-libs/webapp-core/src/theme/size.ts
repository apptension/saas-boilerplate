import { css } from 'styled-components';

import { Breakpoint, responsiveValue } from './media';

export const sizeUnitBase = 8;
export const sizeUnits = (size = 1) => size * sizeUnitBase + 'px';

export const contentHorizontalPadding = responsiveValue(sizeUnits(2), {
  [Breakpoint.TABLET]: sizeUnits(4),
});

export const smallContentHorizontalPadding = responsiveValue(sizeUnits(1), {
  [Breakpoint.TABLET]: sizeUnits(2),
});

export const horizontalPadding = (value: string) => css`
  padding-left: ${value};
  padding-right: ${value};
`;

export const horizontalMargin = (value: string) => css`
  margin-left: ${value};
  margin-right: ${value};
`;
