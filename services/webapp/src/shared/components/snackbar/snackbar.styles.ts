import styled from 'styled-components';
import { Breakpoint, media } from '../../../theme/media';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 343px;
  margin: auto;

  ${media(Breakpoint.TABLET)`
    max-width: 288px;
  `}
`;
