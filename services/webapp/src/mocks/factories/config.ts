import * as faker from 'faker';
import { ConfigState } from '../../modules/config/config.types';
import { createDeepFactory } from './factoryCreators';

export const appConfigFactory = createDeepFactory<ConfigState>(() => ({
  contentfulConfig: {
    privacyPolicy: faker.lorem.paragraphs(2),
    termsAndConditions: faker.lorem.paragraphs(2),
  },
}));
