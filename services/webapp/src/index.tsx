import 'normalize.css/normalize.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { observeFont } from './app/observeFont';
import { initApp } from './app/initApp';

observeFont();
initApp();
export { TestProduct } from './modules/stripe/stripe.types';
