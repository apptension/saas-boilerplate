import styled from 'styled-components';
import { Link, NavLink } from 'react-router-dom';
import { baseButtonStyle } from '../forms/button/button.styles';

export const HtmlLinkContainer = styled.a`
  text-decoration: none;
  ${baseButtonStyle}
`;

export const RouterLinkContainer = styled(Link)`
  text-decoration: none;
  ${baseButtonStyle}
`;

export const RouterNavLinkContainer = styled(NavLink)`
  text-decoration: none;
  ${baseButtonStyle}
`;
