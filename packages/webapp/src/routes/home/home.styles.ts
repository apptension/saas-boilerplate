import { media, size } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-left: ${size.sizeUnits(7)};
  padding-right: ${size.sizeUnits(7)};
  ${size.fullContentHeight};
  margin-top: 40vh;
  ${media.media(media.Breakpoint.TABLET)`
    margin-top: 0;
  `};
`;
