import { addDecorator } from '@storybook/react';
import 'normalize.css/normalize.css';

import { withFontFace, withIntl, withTheme } from './decorators';

addDecorator(withIntl);
addDecorator(withTheme());
addDecorator(withFontFace);
