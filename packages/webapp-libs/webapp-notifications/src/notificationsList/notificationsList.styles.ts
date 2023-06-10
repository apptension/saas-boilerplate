import { Button } from '@sb/webapp-core/components/buttons';
import { color, elevation, media, size, transition, typography } from '@sb/webapp-core/theme';
import styled, { css } from 'styled-components';

type ContainerProps = {
  isOpen: boolean;
};
export const Container = styled.div<ContainerProps>`
  background-color: ${color.white};
  z-index: 50;
  display: grid;
  grid-template-rows: 70px;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'title button'
    'list list';
`;

const topRow = css`
  align-self: center;
  ${size.horizontalMargin(size.sizeUnits(2))}
`;

export const Title = styled.h6`
  ${typography.heading3};
  ${topRow};
  grid-area: title;

  ${media.media(media.Breakpoint.TABLET)`
    ${typography.paragraphBold}
  `}
`;

export const MarkAllAsReadButton = styled(Button)`
  align-self: center;
  ${typography.microlabel};
  grid-area: button;
`;

export const List = styled.ul`
  grid-area: list;
  padding-bottom: ${size.sizeUnits(3)};
`;
