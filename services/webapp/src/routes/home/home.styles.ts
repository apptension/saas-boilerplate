import styled from 'styled-components';
import { ReactComponent as LogoSVG } from '../../images/icons/logo.svg';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const Logo = styled(LogoSVG)`
  width: 100px;
  margin-bottom: 20px;
`;
