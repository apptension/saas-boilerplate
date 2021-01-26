import { Breakpoint, responsiveValue } from './media';

export const header = 80;

export const contentHorizontalPadding = responsiveValue(16, {
  [Breakpoint.TABLET]: 24,
});

export const contentVerticalPadding = responsiveValue(8, {
  [Breakpoint.TABLET]: 16,
});
