import { ContentfulAppConfig } from '../../shared/services/contentful';

export type ContentfulAppConfigPlain = Pick<ContentfulAppConfig, 'name' | 'privacyPolicy' | 'termsAndConditions'>;

export interface ConfigState {
  contentfulConfig?: ContentfulAppConfigPlain;
}
