import { DefaultTheme } from 'styled-components';

export interface ButtonTheme extends DefaultTheme {
  variant: ButtonVariant;
  size: ButtonSize;
  color: ButtonColor | string;
  isDisabled: boolean;
  fixedWidth?: boolean;
}

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  RAW = 'raw',
  FLAT = 'flat',
  ROUND = 'round',
}

export enum ButtonSize {
  SMALL = 'SMALL',
  NORMAL = 'NORMAL',
}

export enum ButtonColor {
  PRIMARY = 'PRIMARY',
}
