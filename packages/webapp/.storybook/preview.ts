import { Preview } from '@storybook/react';
import * as jest from 'jest-mock';

import { withFontFace, withIntl, withTheme } from './decorators';

//@ts-ignore
window.jest = jest;

const preview: Preview = {
  parameters: { layout: 'fullscreen' },
  decorators: [withIntl, withTheme(), withFontFace],
};

export default preview;
