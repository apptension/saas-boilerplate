import { withThemeByDataAttribute } from '@storybook/addon-styling';
import { Preview } from '@storybook/react';
import * as jest from 'jest-mock';

import '../src/styles.css';
import { withFontFace, withIntl, withTheme } from './decorators';

//@ts-ignore
window.jest = jest;

const preview: Preview = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    withIntl,
    withTheme(),
    withFontFace,
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-mode',
    }),
  ],
};

export default preview;
