import { Button } from '@sb/webapp-core/components/buttons';
import { sizeUnits } from '@sb/webapp-core/theme/size';
import { heading3 } from '@sb/webapp-core/theme/typography';
import styled from 'styled-components';

export const Container = styled.div``;

export const Row = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const CtaButton = styled(Button).attrs(() => ({ type: 'submit' }))`
  margin-top: ${sizeUnits(3)};
`;

export const ModalHeader = styled.div`
  ${heading3}
`;
