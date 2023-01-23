import styled from 'styled-components';
import { heading5, MicroLabel } from '../../../../../theme/typography';
import { sizeUnits } from '../../../../../theme/size';
import { RadioButton } from '../../../forms/radioButton';
import { Button, ButtonVariant } from '../../../forms/button';
import { color } from '../../../../../theme';

export const Container = styled.div``;

export const PaymentMethodList = styled.ul`
  list-style: none;
`;

export const PaymentMethodListItem = styled.li`
  & + & {
    margin-top: ${sizeUnits(1)};
  }
`;

export const ExistingPaymentMethodItem = styled(RadioButton)`
  width: 100%;
  position: relative;
`;

export const NewPaymentMethodItem = styled(Button).attrs((props: { isSelected: boolean }) => ({
  variant: props.isSelected ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY,
}))<{ isSelected: boolean }>`
  width: 100%;
  max-width: none;
`;

export const CardElementContainer = styled.div`
  margin-top: ${sizeUnits(3)};
`;

export const Heading = styled.h3`
  ${heading5};
  margin-bottom: ${sizeUnits(1)};
`;

export const ErrorMessage = styled(MicroLabel)`
  margin-top: 2px;
  color: ${color.error};
`;

export const DeleteButton = styled.div`
  position: absolute;
  top: 50%;
  right: 11px;
  line-height: 0;
  margin-top: -8px;
`;
