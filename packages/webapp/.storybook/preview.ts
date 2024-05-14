import { withThemeByClassName } from '@storybook/addon-themes';
import { Preview } from '@storybook/react';
import * as jest from 'jest-mock';

import '../src/styles.css';
import { withIntl } from './decorators';

//@ts-ignore
window.jest = jest;

const preview: Preview = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    withIntl,
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview;
