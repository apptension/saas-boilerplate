import React from 'react';
import { Link, LinkProps, NavLink, NavLinkProps } from 'react-router-dom';
import styled, { DefaultTheme, StyledComponent } from 'styled-components';

import { ButtonThemeProps, baseButtonStyle } from '../button/button.styles';

export const HtmlLinkContainer = styled.a`
  text-decoration: none;
  ${baseButtonStyle}
`;

export const RouterLinkContainer: StyledComponent<
  React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>,
  DefaultTheme,
  ButtonThemeProps,
  never
> = styled(Link)`
  text-decoration: none;
  ${baseButtonStyle}
`;

export const RouterNavLinkContainer: StyledComponent<
  React.ForwardRefExoticComponent<NavLinkProps & React.RefAttributes<HTMLAnchorElement>>,
  DefaultTheme,
  ButtonThemeProps,
  never
> = styled(NavLink)`
  text-decoration: none;
  ${baseButtonStyle}
`;
