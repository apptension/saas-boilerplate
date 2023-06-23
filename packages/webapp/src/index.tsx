import 'react-loading-skeleton/dist/skeleton.css';

import { initApp } from './app/initApp';
import './styles.css';

declare global {
  interface Window {
    gtag: any;
  }
}

initApp();
