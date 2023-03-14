import { color, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.a`
  ${typography.labelBold};
  border-radius: 4px;
  display: inline-block;
  color: ${color.button.text};
  border: 1px solid ${color.button.main};
  background-color: ${color.button.main};
  padding: 0 ${size.smallContentHorizontalPadding};
  height: 40px;
  line-height: 40px;
  text-decoration: none;
`;
