import styled from 'styled-components';
import { fullContentHeight, sizeUnits } from '../../theme/size';
import { Breakpoint, media } from '../../theme/media';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-left: ${sizeUnits(7)};
  padding-right: ${sizeUnits(7)};
  ${fullContentHeight};
  margin-top: 40vh;
  ${media(Breakpoint.TABLET)`
    margin-top: 0;
  `};
`;
