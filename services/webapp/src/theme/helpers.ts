import { css } from 'styled-components';

export const circle = (size: number | string) => css`
  width: ${size};
  height: ${size};
  border-radius: 100%;
`;
