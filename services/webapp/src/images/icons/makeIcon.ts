import { FunctionComponent, SVGProps } from 'react';
import styled, { css } from 'styled-components';

export type IconComponentProps = {
  color?: string;
  size?: number;
};

export const makeIcon = (ImgComponent: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string | undefined }>) => {
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
