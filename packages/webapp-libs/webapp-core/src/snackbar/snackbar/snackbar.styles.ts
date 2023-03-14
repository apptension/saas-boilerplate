import styled from 'styled-components';
import { media } from '../../theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 343px;
  margin: auto;

  ${media.media(media.Breakpoint.TABLET)`
    max-width: 288px;
  `}
`;
