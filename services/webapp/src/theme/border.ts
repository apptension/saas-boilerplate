import { css } from 'styled-components';
import * as colors from './color';
import { skyBlueScale } from './color';

export const regular = `1px solid ${colors.border}`;

export const outline = css`
  outline: none;
  box-shadow: 0 0 0 2px ${skyBlueScale.get(90)};
`;
