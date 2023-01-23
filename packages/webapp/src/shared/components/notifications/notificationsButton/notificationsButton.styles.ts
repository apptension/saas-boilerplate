import styled, { css } from 'styled-components';
import { Button as ButtonBase } from '../../forms/button';
import { color } from '../../../../theme';

type ButtonProps = { hasUnreadNotifications: boolean };
export const Button = styled(ButtonBase)<ButtonProps>`
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
