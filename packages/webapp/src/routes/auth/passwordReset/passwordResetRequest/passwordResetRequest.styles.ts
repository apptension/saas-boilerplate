import styled from 'styled-components';
import { heading4, Label } from '../../../../theme/typography';
import { contentWrapper, fullContentHeight, header, sizeUnits } from '../../../../theme/size';
import { greyScale } from '../../../../theme/color';
import { Breakpoint, media } from '../../../../theme/media';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  ${contentWrapper};
  padding-top: ${sizeUnits(2)};
  text-align: center;
  max-width: 368px;
  ${fullContentHeight};

  ${media(Breakpoint.TABLET)`
    height: 100%;
    justify-content: center;
    padding-top: ${sizeUnits(5)};
    padding-bottom: calc(${header} + ${sizeUnits(5)});
  `};
`;

export const Header = styled.h1`
  ${heading4};
  margin-bottom: ${sizeUnits(5)};
  color: ${greyScale.get(15)};
`;

export const Text = styled(Label)`
  margin-bottom: ${sizeUnits(5)};
  color: ${greyScale.get(15)};
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
