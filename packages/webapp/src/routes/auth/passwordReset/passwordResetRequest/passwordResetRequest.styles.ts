import { color, media, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  ${size.contentWrapper};
  padding-top: ${size.sizeUnits(2)};
  text-align: center;
  max-width: 368px;
  ${size.fullContentHeight};

  ${media.media(media.Breakpoint.TABLET)`
    height: 100%;
    justify-content: center;
    padding-top: ${size.sizeUnits(5)};
    padding-bottom: calc(${size.header} + ${size.sizeUnits(5)});
  `};
`;

export const Header = styled.h1`
  ${typography.heading4};
  margin-bottom: ${size.sizeUnits(5)};
  color: ${color.greyScale.get(15)};
`;

export const Text = styled(typography.Label)`
  margin-bottom: ${size.sizeUnits(5)};
  color: ${color.greyScale.get(15)};
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
