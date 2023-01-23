import styled from 'styled-components';
import { Container as ContainerBase } from '../notification.styles';
import { sizeUnits } from '../../../../../theme/size';
import { circle } from '../../../../../theme';

export const Container = styled(ContainerBase)`
  grid-template-areas: 'avatar title' 'avatar content';
  grid-template-columns: ${sizeUnits(3)} 1fr;
  cursor: none;
  transition: none;
`;

export const Avatar = styled.div`
  grid-area: avatar;
  ${circle(sizeUnits(3))}
`;

export const Title = styled.div`
  grid-area: title;
  flex-direction: column;
  display: flex;
  justify-content: space-between;
  height: ${sizeUnits(3)};
`;

export const Content = styled.div`
  grid-area: content;
  height: ${sizeUnits(6)};
  margin-top: ${sizeUnits(1)};
`;
