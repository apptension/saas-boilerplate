import { Button, RadioButton } from '@sb/webapp-core/components/buttons';
import { color, media, size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div``;

export const Form = styled.form.attrs(() => ({ noValidate: true }))`
  width: 100%;
  max-width: 480px;
`;

export const ErrorMessage = styled(typography.MicroLabel)`
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
  grid-column-gap: ${size.sizeUnits(1)};
  grid-row-gap: ${size.sizeUnits(2)};

  ${media.media(media.Breakpoint.TABLET)`
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
  ${typography.heading5};
  margin-top: ${size.sizeUnits(3)};
  margin-bottom: ${size.sizeUnits(1)};
`;

export const SubmitButton = styled(Button).attrs(() => ({ type: 'submit' }))`
  margin-top: ${size.sizeUnits(5)};
  width: 100%;
  max-width: none;
`;

export const StripePaymentFormContainer = styled.div`
  margin-top: ${size.sizeUnits(3)};
`;
