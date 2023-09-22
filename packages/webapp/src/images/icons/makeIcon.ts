import { FunctionComponent, SVGProps } from 'react';
import { css, styled } from 'styled-components';

export type IconComponentProps = {
  color?: string;
  size?: number;
};

export const makeIcon = (ImgComponent: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>) => {
  return styled(ImgComponent)<IconComponentProps>`
    ${({ size }) =>
      size &&
      css`
        width: ${size}px;
        height: ${size}px;
      `}

    ${({ color }) =>
      color &&
      css`
        path {
          fill: ${color};
        }
      `}
  `;
};
