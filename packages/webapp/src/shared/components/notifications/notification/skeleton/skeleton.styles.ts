import { circle, size } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

import { Container as ContainerBase } from '../notification.styles';

export const Container = styled(ContainerBase)`
  grid-template-areas: 'avatar title' 'avatar content';
  grid-template-columns: ${size.sizeUnits(3)} 1fr;
  cursor: none;
  transition: none;
`;

export const Avatar = styled.div`
  grid-area: avatar;
  ${circle(size.sizeUnits(3))}
`;

export const Title = styled.div`
  grid-area: title;
  flex-direction: column;
  display: flex;
  justify-content: space-between;
  height: ${size.sizeUnits(3)};
`;

export const Content = styled.div`
  grid-area: content;
  height: ${size.sizeUnits(6)};
  margin-top: ${size.sizeUnits(1)};
`;
