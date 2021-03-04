import React from 'react';
import styled from 'styled-components';
import { Button } from '../../button';

import { ReactComponent as FacebookIcon } from '../../../../images/icons/facebook.svg';
import { ReactComponent as GoogleIcon } from '../../../../images/icons/google.svg';
import { ButtonVariant } from '../../button/button.types';
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
