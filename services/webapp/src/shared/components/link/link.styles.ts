import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { baseButtonStyle } from '../button/button.styles';

export const HtmlLinkContainer = styled.a`
  text-decoration: none;
  ${baseButtonStyle}
`;

export const RouterLinkContainer = styled(Link)`
  text-decoration: none;
  ${baseButtonStyle}
`;
