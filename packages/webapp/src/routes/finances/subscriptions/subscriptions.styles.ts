import styled from 'styled-components';
import { ComponentProps } from 'react';
import { contentWrapper, sizeUnits, verticalPadding } from '../../../theme/size';
import { heading3, heading4, label, labelBold } from '../../../theme/typography';
import { greyScale } from '../../../theme/color';
import { Link as LinkBase } from '../../../shared/components/link';
import { ButtonVariant } from '../../../shared/components/forms/button';
import { Breakpoint, media } from '../../../theme/media';

export const Container = styled.div`
  ${verticalPadding(sizeUnits(2))};
`;

export const Section = styled.section`
  ${contentWrapper};
  padding-bottom: ${sizeUnits(4)};

  & + & {
    border-top: 1px solid ${greyScale.get(95)};
    padding-top: ${sizeUnits(4)};
  }

  ${media(Breakpoint.TABLET)`
    padding-bottom: ${sizeUnits(6)};
  `};
`;

export const Header = styled.h1`
  ${heading3};
`;

export const Row = styled.div`
  ${label};
  margin-top: ${sizeUnits(1)};
`;

export const RowValue = styled.span`
  margin-left: ${sizeUnits(1)};
  ${labelBold};
`;

export const Subheader = styled.h2`
  margin-top: ${sizeUnits(4)};
  ${heading4};

  ${RowValue} {
    ${heading4};
  }
`;

export const Link = styled(LinkBase).attrs<ComponentProps<typeof LinkBase>>(({ variant }) => ({
  variant: variant ?? ButtonVariant.PRIMARY,
}))<ComponentProps<typeof LinkBase>>`
  margin-top: ${sizeUnits(3)};

  & + & {
    margin-top: ${sizeUnits(1)};

    ${media(Breakpoint.TABLET)`
      margin-top: 0;
      margin-left: ${sizeUnits(2)};
    `};
  }

  ${media(Breakpoint.TABLET)`
      min-width: 232px;
      & + & {
        margin-top: ${sizeUnits(1)};
        margin-left: ${sizeUnits(2)};
      }
  `};
`;
