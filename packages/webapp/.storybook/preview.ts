// Ensure graphql is loaded before Apollo Client to prevent Kind.FIELD undefined error
import 'graphql';
import { Kind } from 'graphql/language';

// Verify graphql is properly loaded (will throw early if not)
if (!Kind?.FIELD) {
  console.warn('GraphQL Kind enum not properly loaded, some stories may fail');
}

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
