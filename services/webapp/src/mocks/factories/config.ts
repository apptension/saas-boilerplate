import * as faker from 'faker';
import { ConfigState } from '../../modules/config/config.types';
import { Factory } from './types';

export const appConfigFactory: Factory<ConfigState> = (overrides = {}) => ({
  contentfulConfig: {
    privacyPolicy: faker.lorem.paragraphs(2),
    termsAndConditions: faker.lorem.paragraphs(2),
    ...overrides.contentfulConfig,
  },
});
