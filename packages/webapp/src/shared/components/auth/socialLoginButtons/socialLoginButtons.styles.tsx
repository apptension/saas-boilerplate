import { Button } from '@sb/webapp-core/components/buttons';
import { size } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;

  ${Button} {
    ${size.formFieldWidth};
  }

  ${Button}:first-child {
    margin-bottom: ${size.sizeUnits(2)};
  }
`;
