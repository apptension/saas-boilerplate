import styled from 'styled-components';
import { heading3, label } from '../../theme/typography';
import { Breakpoint, media } from '../../theme/media';
import { contentWithLimitedWidth, contentWrapper, sizeUnits } from '../../theme/size';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  ${contentWrapper};
  ${contentWithLimitedWidth};
  padding-top: ${sizeUnits(4)};
  padding-bottom: ${sizeUnits(4)};

  ${media(Breakpoint.TABLET)`
    margin-left: 0;
  `};
`;

export const Title = styled.h1`
  ${heading3};
  margin-bottom: ${sizeUnits(3)};
`;

export const Description = styled.p`
  ${label};
`;

export const Image = styled.img`
  width: 100%;
  margin-top: ${sizeUnits(3)};

  ${media(Breakpoint.TABLET)`
    margin-top: ${sizeUnits(4)};
  `};
`;
