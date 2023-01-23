import styled from 'styled-components';
import { heading4, Label } from '../../../theme/typography';
import { formFieldWidth, fullContentHeight, header, sizeUnits } from '../../../theme/size';
import { Breakpoint, media } from '../../../theme/media';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  ${formFieldWidth};
  margin: auto;
  ${fullContentHeight};

  ${media(Breakpoint.TABLET)`
    height: 100%;
    justify-content: center;
    padding-top: ${sizeUnits(3)};
    padding-bottom: calc(${header} + ${sizeUnits(3)});
  `};
`;

export const Links = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${sizeUnits(3)};

  ${media(Breakpoint.TABLET)`
    margin-top: ${sizeUnits(5)};
  `};
`;

export const Header = styled.h1`
  ${heading4};
  margin: ${sizeUnits(2)} 0 ${sizeUnits(5)};
`;

export const OrDivider = styled(Label)`
  margin-top: ${sizeUnits(2)};
  margin-bottom: ${sizeUnits(2)};
`;
