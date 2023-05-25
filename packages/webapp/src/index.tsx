import 'normalize.css/normalize.css';
import 'react-loading-skeleton/dist/skeleton.css';

import { initApp } from './app/initApp';
import { initializeFontFace } from './app/utils/initializeFontFace';
import { observeFont } from './app/utils/observeFont';

declare global {
  interface Window {
    gtag: any;
  }
}

observeFont();
initApp();
initializeFontFace();
