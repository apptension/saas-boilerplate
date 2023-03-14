import { media, size } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

import { SubscriptionPlanItem } from '../subscriptionPlanItem';

export const Plans = styled.div`
  margin-top: ${size.sizeUnits(5)};

  ${media.media(media.Breakpoint.TABLET)`
      display: flex;
  `};
`;

export const PlanItem = styled(SubscriptionPlanItem)`
  & + & {
    margin-top: ${size.sizeUnits(3)};
  }

  ${media.media(media.Breakpoint.TABLET)`
    & + & {
      margin-top: 0;
      margin-left: ${size.sizeUnits(4)};
    }
  `};
`;
