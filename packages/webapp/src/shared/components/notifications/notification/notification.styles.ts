import { Button } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { RelativeDate as RelativeDateBase } from '@saas-boilerplate-app/webapp-core/components/dateTime/relativeDate';
import { color, size, transition, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled, { css } from 'styled-components';

import { NotificationThemeProps } from './notification.types';

const readColor = color.greyScale.get(55);

export const Container = styled.li<NotificationThemeProps>`
  display: grid;
  grid-column-gap: ${size.sizeUnits(1)};
  transition: background-color ${transition.primary};
  color: ${(props) => (props.theme.isRead ? readColor : 'inherit')};
  ${size.verticalPadding(size.sizeUnits(2))}
  ${size.horizontalPadding(size.sizeUnits(2))}
  ${(props) =>
    props.theme.hasAvatar
      ? css`
          grid-template-areas:
            'avatar time markAsRead'
            'avatar title markAsRead'
            'avatar content content'
            '. actions actions';
          grid-template-columns: ${size.sizeUnits(3)} 1fr ${size.sizeUnits(3)};
        `
      : css`
          grid-template-areas:
            'time markAsRead'
            'title markAsRead'
            'content content'
            'actions actions';
          grid-template-columns: 1fr ${size.sizeUnits(3)};
        `}


  &:hover, &:focus {
    background-color: ${color.skyBlueScale.get(95)};
    cursor: pointer;
  }

  &:active {
    background-color: ${color.skyBlueScale.get(90)};
  }
`;

export const Avatar = styled.img`
  margin-top: ${size.sizeUnits(0.5)};
  grid-area: avatar;
  border-radius: 100%;
  width: ${size.sizeUnits(3)};
  height: ${size.sizeUnits(3)};
  object-fit: cover;
`;

export const RelativeDate = styled(RelativeDateBase)`
  grid-area: time;
  ${typography.microlabel};
`;

export const Title = styled.h6`
  grid-area: title;
  ${typography.labelBold};
`;

export const Content = styled.p`
  grid-area: content;
  margin-top: ${size.sizeUnits(0.25)};
  ${typography.label};
`;

export const MarkAsReadButton = styled(Button)<NotificationThemeProps>`
  grid-area: markAsRead;
  width: ${size.sizeUnits(3)};
  height: ${size.sizeUnits(3)};
  padding: ${size.sizeUnits(0.5)};
  position: relative;
  top: -${size.sizeUnits(0.5)};

  ${(props) =>
    props.theme.isRead &&
    css`
      &,
      :focus,
      :active {
        color: ${readColor};
      }

      &:not(:disabled):hover {
        color: ${color.greyScale.get(75)};
      }
    `}
`;

export const Actions = styled.footer`
  grid-area: actions;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding-top: ${size.sizeUnits(1)};
  margin: -${size.sizeUnits(0.5)};

  > * {
    margin: ${size.sizeUnits(0.25)};
  }
`;
