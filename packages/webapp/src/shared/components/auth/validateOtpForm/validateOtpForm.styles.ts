import { color } from '@sb/webapp-core/theme';
import { fullContentHeight, sizeUnits } from '@sb/webapp-core/theme/size';
import { H4, MicroLabel } from '@sb/webapp-core/theme/typography';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  flex-direction: column;
  ${fullContentHeight};
  max-width: 300px;
  margin: 0 auto;
  text-align: center;
`;

export const Header = styled(H4)`
  margin-bottom: ${sizeUnits(2)};
`;

export const ErrorMessage = styled(MicroLabel)`
  padding-top: ${sizeUnits(2)};
  font-size: 14px;
  color: ${color.error};
  max-width: 100%;
  text-align: center;
`;
