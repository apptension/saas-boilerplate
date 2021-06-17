import styled, { css } from 'styled-components';
import { heading3, microlabel, paragraphBold } from '../../../../theme/typography';
import { Button } from '../../button';
import { horizontalMargin, sizeUnits } from '../../../../theme/size';
import { color, size, transition } from '../../../../theme';
import { Breakpoint, media } from '../../../../theme/media';
import { elevationLightest } from '../../../../theme/elevation';

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

  ${media(Breakpoint.TABLET)`
      ${elevationLightest};
      width: ${sizeUnits(40)};
      height: auto;
      max-height: calc(100% - ${size.header} - ${sizeUnits(2)});
      top: calc(${size.header} - ${sizeUnits(1)});
      right: ${sizeUnits(5)};
  `}
`;

const topRow = css`
  align-self: center;
  ${horizontalMargin(sizeUnits(2))}
`;

export const Title = styled.h6`
  ${heading3};
  ${topRow};
  grid-area: title;

  ${media(Breakpoint.TABLET)`
    ${paragraphBold}
  `}
`;

export const MarkAllAsReadButton = styled(Button)`
  ${topRow};
  ${microlabel};
  grid-area: button;
`;

export const List = styled.ul`
  grid-area: list;
`;
