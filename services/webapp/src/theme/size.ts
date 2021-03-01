import { css } from 'styled-components';
import { Breakpoint, media, responsiveValue } from './media';

export const sizeUnit = 8;
export const sizeUnits = (size = 1) => size * sizeUnit;

export const header = sizeUnits(8);

export const contentHorizontalPadding = responsiveValue(sizeUnits(2), {
  [Breakpoint.TABLET]: sizeUnits(4),
});

export const smallContentHorizontalPadding = responsiveValue(sizeUnits(1), {
  [Breakpoint.TABLET]: sizeUnits(2),
});

export const contentVerticalPadding = responsiveValue(sizeUnits(1), {
  [Breakpoint.TABLET]: sizeUnits(1.5),
});

export const contentWrapper = css`
  max-width: 1360px;
  padding-left: ${sizeUnits(3)}px;
  padding-right: ${sizeUnits(3)}px;
  margin-left: auto;
  margin-right: auto;

  ${media(Breakpoint.TABLET)`
    padding-left: ${sizeUnits(5)}px;
    padding-right: ${sizeUnits(5)}px;
  `};
`;
