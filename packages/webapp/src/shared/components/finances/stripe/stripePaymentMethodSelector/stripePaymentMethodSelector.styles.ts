import { Button, ButtonVariant, RadioButton } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { color, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div``;

export const PaymentMethodList = styled.ul`
  list-style: none;
`;

export const PaymentMethodListItem = styled.li`
  & + & {
    margin-top: ${size.sizeUnits(1)};
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
  margin-top: ${size.sizeUnits(3)};
`;

export const Heading = styled.h3`
  ${typography.heading5};
  margin-bottom: ${size.sizeUnits(1)};
`;

export const ErrorMessage = styled(typography.MicroLabel)`
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
