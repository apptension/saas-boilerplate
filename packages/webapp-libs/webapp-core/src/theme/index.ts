import { useTheme } from 'styled-components';

import * as border from './border';
import * as color from './color';
import * as elevation from './elevation';
import { fontFamily, fontWeight } from './font';
import * as global from './global';
import { initializeFontFace } from './initializeFontFace';
import * as media from './media';
import * as size from './size';
import * as transition from './transition';
import * as typography from './typography';
import * as zIndex from './zIndex';

export * from './helpers';
export {
  global,
  border,
  color,
  fontFamily,
  fontWeight,
  elevation,
  size,
  zIndex,
  transition,
  media,
  typography,
  useTheme,
  initializeFontFace,
};
