import { Button, ButtonVariant } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { size } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

import { FacebookIcon, GoogleIcon } from '../../../../images/icons';

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
  ${size.formFieldWidth};
  margin-bottom: ${size.sizeUnits(2)};
`;

export const GoogleButton = styled(Button).attrs(() => ({
  icon: <GoogleIcon />,
  variant: ButtonVariant.SECONDARY,
}))`
  ${size.formFieldWidth};
`;
