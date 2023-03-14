import { ButtonVariant, Link as LinkBase } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { color, media, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import { ComponentProps } from 'react';
import styled from 'styled-components';

export const Container = styled.div`
  ${size.verticalPadding(size.sizeUnits(2))};
`;

export const Section = styled.section`
  ${size.contentWrapper};
  padding-bottom: ${size.sizeUnits(4)};

  & + & {
    border-top: 1px solid ${color.greyScale.get(95)};
    padding-top: ${size.sizeUnits(4)};
  }

  ${media.media(media.Breakpoint.TABLET)`
    padding-bottom: ${size.sizeUnits(6)};
  `};
`;

export const Header = styled.h1`
  ${typography.heading3};
`;

export const Row = styled.div`
  ${typography.label};
  margin-top: ${size.sizeUnits(1)};
`;

export const RowValue = styled.span`
  margin-left: ${size.sizeUnits(1)};
  ${typography.labelBold};
`;

export const Subheader = styled.h2`
  margin-top: ${size.sizeUnits(4)};
  ${typography.heading4};

  ${RowValue} {
    ${typography.heading4};
  }
`;

export const Link = styled(LinkBase).attrs<ComponentProps<typeof LinkBase>>(({ variant }) => ({
  variant: variant ?? ButtonVariant.PRIMARY,
}))<ComponentProps<typeof LinkBase>>`
  margin-top: ${size.sizeUnits(3)};

  & + & {
    margin-top: ${size.sizeUnits(1)};

    ${media.media(media.Breakpoint.TABLET)`
      margin-top: 0;
      margin-left: ${size.sizeUnits(2)};
    `};
  }

  ${media.media(media.Breakpoint.TABLET)`
      min-width: 232px;
      & + & {
        margin-top: ${size.sizeUnits(1)};
        margin-left: ${size.sizeUnits(2)};
      }
  `};
`;
