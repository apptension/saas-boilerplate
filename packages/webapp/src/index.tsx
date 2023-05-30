import 'react-loading-skeleton/dist/skeleton.css';

import { initApp } from './app/initApp';
import { initializeFontFace } from './app/utils/initializeFontFace';
import { observeFont } from './app/utils/observeFont';
import './styles.css';

declare global {
  interface Window {
    gtag: any;
  }
}

observeFont();
initApp();
initializeFontFace();
