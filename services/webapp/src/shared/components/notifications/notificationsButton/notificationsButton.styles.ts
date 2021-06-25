import styled, { css } from 'styled-components';
import { Button as ButtonBase } from '../../button';
import { color } from '../../../../theme';

export const Button = styled(ButtonBase)<{ hasUnreadNotifications: boolean }>`
  svg {
    width: 23px;
    height: 18px;

    ${(props) =>
      props.hasUnreadNotifications &&
      css`
        circle,
        path:last-of-type {
          fill: ${color.error};
        }
      `};
  }
`;
