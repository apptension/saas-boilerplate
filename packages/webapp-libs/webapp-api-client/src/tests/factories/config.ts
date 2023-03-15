import { ContentfulAppConfig } from '../../contentful';
import { createDeepFactory } from '../utils';

export const appConfigFactory = createDeepFactory<ContentfulAppConfig>(() => ({
  privacyPolicy: 'Lorem ipsum privacy policy',
  termsAndConditions: 'Lorem ipsum terms and conditions',
  sys: { id: 'test-id', environmentId: 'test', spaceId: 'test' },
  contentfulMetadata: { tags: [] },
  name: 'Global App Config',
}));
