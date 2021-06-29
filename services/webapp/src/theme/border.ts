import { css } from 'styled-components';
import * as colors from './color';

export const regular = `1px solid ${colors.border}`;

export const light = `1px solid ${colors.greyScale.get(95)}`;

export const outline = css`
  outline: none;
  box-shadow: 0 0 0 2px ${colors.skyBlueScale.get(90)};
`;
