import styled from 'styled-components';
import { contentWrapper, sizeUnits, verticalPadding } from '../../../theme/size';
import { heading3, heading4 } from '../../../theme/typography';
import { Breakpoint, media } from '../../../theme/media';
import { SubscriptionPlanItem } from './subscriptionPlanItem';

export const Container = styled.div`
  ${contentWrapper};
  ${verticalPadding(sizeUnits(3))};
`;

export const Header = styled.h1`
  ${heading3};
  margin-bottom: ${sizeUnits(2)};
`;

export const Subheader = styled.h2`
  ${heading4}
`;

export const Plans = styled.div`
  margin-top: ${sizeUnits(5)};

  ${media(Breakpoint.TABLET)`
      display: flex;
  `};
`;

export const PlanItem = styled(SubscriptionPlanItem)`
  & + & {
    margin-top: ${sizeUnits(3)};
  }

  ${media(Breakpoint.TABLET)`
    & + & {
      margin-top: 0;
      margin-left: ${sizeUnits(4)};
    }
  `};
`;
