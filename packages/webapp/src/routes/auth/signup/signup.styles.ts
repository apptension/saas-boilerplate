import { media, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';


export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  ${size.formFieldWidth};
  margin: auto;
  ${size.fullContentHeight};

  ${media.media(media.Breakpoint.TABLET)`
    height: 100%;
    justify-content: center;
    padding-top: ${size.sizeUnits(3)};
    padding-bottom: calc(${size.header} + ${size.sizeUnits(3)});
  `};
`;

export const Links = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${size.sizeUnits(3)};

  ${media.media(media.Breakpoint.TABLET)`
    margin-top: ${size.sizeUnits(5)};
  `};
`;

export const Header = styled.h1`
  ${typography.heading4};
  margin: ${size.sizeUnits(2)} 0 ${size.sizeUnits(5)};
`;

export const OrDivider = styled(typography.Label)`
  margin-top: ${size.sizeUnits(2)};
  margin-bottom: ${size.sizeUnits(2)};
`;
