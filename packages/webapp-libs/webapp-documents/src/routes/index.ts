import { asyncComponent } from '@sb/webapp-core/utils/asyncComponent';

export const Documents = asyncComponent(() => import('./documents'));
