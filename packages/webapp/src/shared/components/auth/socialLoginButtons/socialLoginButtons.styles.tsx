import styled from 'styled-components';
import { Button, ButtonVariant } from '../../forms/button';
import { FacebookIcon, GoogleIcon } from '../../../../images/icons';
import { formFieldWidth, sizeUnits } from '../../../../theme/size';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`;

export const FacebookButton = styled(Button).attrs(() => ({
  icon: <FacebookIcon />,
  variant: ButtonVariant.SECONDARY,
}))`
  ${formFieldWidth};
  margin-bottom: ${sizeUnits(2)};
`;

export const GoogleButton = styled(Button).attrs(() => ({
  icon: <GoogleIcon />,
  variant: ButtonVariant.SECONDARY,
}))`
  ${formFieldWidth};
`;
