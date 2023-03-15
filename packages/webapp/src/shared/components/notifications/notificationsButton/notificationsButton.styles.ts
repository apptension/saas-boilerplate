import { Button as ButtonBase } from '@sb/webapp-core/components/buttons';
import { color } from '@sb/webapp-core/theme';
import styled, { css } from 'styled-components';

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
