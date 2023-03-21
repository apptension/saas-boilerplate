import { Button } from '@sb/webapp-core/components/buttons';
import { color, elevation, media, size, transition, typography } from '@sb/webapp-core/theme';
import styled, { css } from 'styled-components';

type ContainerProps = {
  isOpen: boolean;
};
export const Container = styled.div<ContainerProps>`
  position: fixed;
  background-color: ${color.white};
  overflow-y: auto;
  z-index: 1;
  right: 0;
  top: ${size.header};
  width: 100%;
  height: calc(100% - ${size.header});
  display: grid;
  grid-template-rows: 70px;
  grid-template-columns: 1fr max-content;
  grid-template-areas:
    'title button'
    'list list';

  ${(props) =>
    transition.withVisibility({
      isVisible: props.isOpen,
      duration: '0.1s',
      properties: [
        {
          name: 'opacity',
          valueWhenHidden: '0',
          valueWhenVisible: '1',
        },
      ],
    })}

  ${media.media(media.Breakpoint.TABLET)`
      ${elevation.lightest};
      width: ${size.sizeUnits(40)};
      height: auto;
      max-height: calc(100% - ${size.header} - ${size.sizeUnits(2)});
      top: calc(${size.header} - ${size.sizeUnits(1)});
      right: ${size.sizeUnits(5)};
  `}
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
  ${topRow};
  ${typography.microlabel};
  grid-area: button;
`;

export const List = styled.ul`
  grid-area: list;
  padding-bottom: ${size.sizeUnits(3)};
`;
