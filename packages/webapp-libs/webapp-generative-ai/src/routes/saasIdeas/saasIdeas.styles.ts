import { media, size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  ${size.verticalPadding(size.sizeUnits(4))};

  ${media.media(media.Breakpoint.TABLET)`
    ${size.verticalPadding(size.sizeUnits(2))};
    ${size.horizontalPadding(size.sizeUnits(5))};
  `};
`;

export const Field = styled.div`
  max-width: 480px;
  margin-top: ${size.sizeUnits(2)};
  margin-bottom: ${size.sizeUnits(4)};

  > div {
    max-width: 480px;
  }
`;

export const List = styled.ul`
  max-width: 480px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ListItem = styled.li`
  ${size.verticalMargin(size.sizeUnits(2))};
`;

export const Title = styled(typography.H1)`
  ${size.verticalMargin(size.sizeUnits(3))};
`;
