import { ContentfulAppConfig, ContentfulPlain } from '../../shared/services/contentful';

export type ContentfulAppConfigPlain = ContentfulPlain<ContentfulAppConfig>;

export interface ConfigState {
  contentfulConfig?: ContentfulAppConfigPlain;
}
