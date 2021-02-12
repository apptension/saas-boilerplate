import * as faker from 'faker';
import { mergeDeepRight } from 'ramda';
import { ConfigState } from '../../modules/config/config.types';
import { Factory } from './types';

export const appConfigFactory: Factory<ConfigState> = (overrides = {}) =>
  mergeDeepRight(
    {
      contentfulConfig: {
        privacyPolicy: faker.lorem.paragraphs(2),
        termsAndConditions: faker.lorem.paragraphs(2),
      },
    },
    overrides
  );
