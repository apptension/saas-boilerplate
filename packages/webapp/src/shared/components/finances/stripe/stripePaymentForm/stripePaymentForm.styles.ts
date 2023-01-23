import styled from 'styled-components';
import { heading5, MicroLabel } from '../../../../../theme/typography';
import { color } from '../../../../../theme';
import { RadioButton } from '../../../forms/radioButton';
import { sizeUnits } from '../../../../../theme/size';
import { Breakpoint, media } from '../../../../../theme/media';
import { Button } from '../../../forms/button';

export const Container = styled.div``;

export const Form = styled.form.attrs(() => ({ noValidate: true }))`
  width: 100%;
  max-width: 480px;
`;

export const ErrorMessage = styled(MicroLabel)`
  margin-top: 2px;
  color: ${color.error};
`;

export const ProductListContainer = styled.ul`
  list-style: none;
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  display: grid;
  padding: 0;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: ${sizeUnits(1)};
  grid-row-gap: ${sizeUnits(2)};

  ${media(Breakpoint.TABLET)`
    grid-template-columns: repeat(3, 1fr);
  `}
`;

export const ProductListItem = styled.li`
  display: flex;
`;

export const ProductListItemButton = styled(RadioButton)`
  width: 100%;
`;

export const Heading = styled.h3`
  ${heading5};
  margin-top: ${sizeUnits(3)};
  margin-bottom: ${sizeUnits(1)};
`;

export const SubmitButton = styled(Button).attrs(() => ({ type: 'submit' }))`
  margin-top: ${sizeUnits(5)};
  width: 100%;
  max-width: none;
`;

export const StripePaymentFormContainer = styled.div`
  margin-top: ${sizeUnits(3)};
`;
