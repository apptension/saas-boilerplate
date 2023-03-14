import { media, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  ${size.contentWrapper};
  ${size.contentWithLimitedWidth};
  padding-top: ${size.sizeUnits(4)};
  padding-bottom: ${size.sizeUnits(4)};

  ${media.media(media.Breakpoint.TABLET)`
    margin-left: 0;
  `};
`;

export const Title = styled.h1`
  ${typography.heading3};
  margin-bottom: ${size.sizeUnits(3)};
`;

export const Description = styled.p`
  ${typography.label};
`;

export const Image = styled.img`
  width: 100%;
  margin-top: ${size.sizeUnits(3)};

  ${media.media(media.Breakpoint.TABLET)`
    margin-top: ${size.sizeUnits(4)};
  `};
`;
