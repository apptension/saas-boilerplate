import styled, { css } from 'styled-components';
import { Breakpoint, media, responsiveValue } from './media';

export const sizeUnitBase = 8;
export const sizeUnits = (size = 1) => size * sizeUnitBase + 'px';

export const header = responsiveValue(sizeUnits(7), {
  [Breakpoint.TABLET]: sizeUnits(8),
});

export const sideMenu = '281px';

export const fullContentHeight = css`
  ${media(Breakpoint.TABLET)`
    min-height: calc(100vh - ${header});
  `};
`;

export const contentHorizontalPadding = responsiveValue(sizeUnits(2), {
  [Breakpoint.TABLET]: sizeUnits(4),
});

export const smallContentHorizontalPadding = responsiveValue(sizeUnits(1), {
  [Breakpoint.TABLET]: sizeUnits(2),
});

export const contentVerticalPadding = responsiveValue(sizeUnits(1), {
  [Breakpoint.TABLET]: sizeUnits(1.5),
});

export const contentWithLimitedWidth = css`
  max-width: 684px;
`;

export const contentWrapper = css`
  width: 100%;
  padding-left: ${sizeUnits(2)};
  padding-right: ${sizeUnits(2)};
  margin-left: auto;
  margin-right: auto;

  ${media(Breakpoint.TABLET)`
    padding-left: ${sizeUnits(5)};
    padding-right: ${sizeUnits(5)};
  `};
`;

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

export const verticalMargin = (value: string) => css`
  margin-top: ${value};
  margin-bottom: ${value};
`;

export const formFieldWidth = css`
  width: 100%;
  max-width: 342px;

  ${media(Breakpoint.TABLET)`
    max-width: 288px;
  `};
`;

export const FormFieldsRow = styled.div`
  & + & {
    margin-top: ${sizeUnits(3)};
  }
`;

export const formVerticalFieldsGutter = sizeUnits(3);
