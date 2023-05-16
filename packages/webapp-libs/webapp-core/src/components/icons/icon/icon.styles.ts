import { Icon, IconProps } from '@iconify/react';
import React from 'react';
import styled, { DefaultTheme, StyledComponent } from 'styled-components';

type IconContainerProps = { size: number };
export const Container: StyledComponent<
  (props: IconProps & IconContainerProps) => React.ReactElement<IconProps, string | React.JSXElementConstructor<any>>,
  DefaultTheme
> = styled(Icon)<IconContainerProps>`
  font-size: ${(props) => props.size}px;
  line-height: 0;
`;
