import { ConfigState } from '../../modules/config/config.types';
import { createDeepFactory } from './factoryCreators';

export const appConfigFactory = createDeepFactory<ConfigState>(() => ({
  contentfulConfig: {
    privacyPolicy: 'Lorem ipsum privacy policy',
    termsAndConditions: 'Lorem ipsum terms and conditions',
  },
}));
