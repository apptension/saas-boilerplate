import { DefaultTheme } from 'styled-components';

export interface ButtonTheme extends DefaultTheme {
  variant: ButtonVariant;
  isDisabled: boolean;
  fixedWidth?: boolean;
}

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  RAW = 'raw',
  FLAT = 'flat',
}
