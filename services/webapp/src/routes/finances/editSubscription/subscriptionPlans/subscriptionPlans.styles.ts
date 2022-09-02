import styled from 'styled-components';

import { sizeUnits } from '../../../../theme/size';
import { Breakpoint, media } from '../../../../theme/media';
import { SubscriptionPlanItem } from '../subscriptionPlanItem';

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
