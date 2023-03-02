import 'normalize.css/normalize.css';
import 'react-loading-skeleton/dist/skeleton.css';

import { initApp } from './app/initApp';
import { observeFont } from './app/observeFont';

observeFont();
initApp();
