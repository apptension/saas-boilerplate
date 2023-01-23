import { DefaultTheme, ThemeProps } from 'styled-components';

export interface NotificationTheme extends DefaultTheme {
  isRead: boolean;
  hasAvatar: boolean;
}

export type NotificationThemeProps = ThemeProps<NotificationTheme>;
