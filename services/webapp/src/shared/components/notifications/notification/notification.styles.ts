import styled, { css, ThemeProps } from 'styled-components';
import { horizontalPadding, sizeUnits, verticalPadding } from '../../../../theme/size';
import { label, labelBold, microlabel } from '../../../../theme/typography';
import { color, transition } from '../../../../theme';
import { Button } from '../../button';
import { NotificationTheme } from './notification.types';

type NotificationThemeProps = ThemeProps<NotificationTheme>;

const readColor = color.greyScale.get(55);

export const Container = styled.li<NotificationThemeProps>`
  display: grid;
  grid-template-areas:
    'avatar time markAsRead'
    'avatar title markAsRead'
    'avatar content content';
  grid-template-columns: ${sizeUnits(3)} 1fr ${sizeUnits(3)};
  grid-column-gap: ${sizeUnits(1)};
  transition: background-color ${transition.primary};
  color: ${(props) => (props.theme.isRead ? readColor : 'inherit')};
  ${verticalPadding(sizeUnits(2))}
  ${horizontalPadding(sizeUnits(2))}


  &:hover {
    background-color: ${color.skyBlueScale.get(95)};
    cursor: pointer;
  }
`;

export const Avatar = styled.img`
  margin-top: ${sizeUnits(0.5)};
  grid-area: avatar;
  border-radius: 100%;
`;

export const Time = styled.time`
  grid-area: time;
  ${microlabel};
`;

export const Title = styled.h6`
  grid-area: title;
  ${labelBold};
`;

export const Content = styled.p`
  grid-area: content;
  margin-top: ${sizeUnits(0.25)};
  ${label};
`;

export const MarkAsReadButton = styled(Button)<NotificationThemeProps>`
  grid-area: markAsRead;
  width: ${sizeUnits(3)};
  height: ${sizeUnits(3)};
  padding: ${sizeUnits(0.5)};
  position: relative;
  top: -${sizeUnits(0.5)};

  ${(props) =>
    props.theme.isRead &&
    css`
      color: ${readColor};
    `}
`;
