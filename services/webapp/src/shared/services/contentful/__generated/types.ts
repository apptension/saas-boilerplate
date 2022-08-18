export type Maybe<T> = T | undefined | null;
export type InputMaybe<T> = T | undefined | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * A date-time string at UTC, such as 2007-12-03T10:15:30Z,
   *     compliant with the 'date-time' format outlined in section 5.6 of
   *     the RFC 3339 profile of the ISO 8601 standard for representation
   *     of dates and times using the Gregorian calendar.
   */
  DateTime: any;
  /** The 'Dimension' type represents dimensions as whole numeric values between `1` and `4000`. */
  Dimension: any;
  /** The 'HexColor' type represents color in `rgb:ffffff` string format. */
  HexColor: any;
  /** The 'Quality' type represents quality as whole numeric values between `1` and `100`. */
  Quality: any;
}

/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export interface ContentfulAppConfig extends ContentfulEntry {
  __typename?: 'AppConfig';
  sys: ContentfulSys;
  contentfulMetadata: ContentfulContentfulMetadata;
  linkedFrom?: Maybe<ContentfulAppConfigLinkingCollections>;
  name?: Maybe<Scalars['String']>;
  privacyPolicy?: Maybe<Scalars['String']>;
  termsAndConditions?: Maybe<Scalars['String']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export interface ContentfulAppConfigLinkedFromArgs {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export interface ContentfulAppConfigNameArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export interface ContentfulAppConfigPrivacyPolicyArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export interface ContentfulAppConfigTermsAndConditionsArgs {
  locale?: InputMaybe<Scalars['String']>;
}

export interface ContentfulAppConfigCollection {
  __typename?: 'AppConfigCollection';
  total: Scalars['Int'];
  skip: Scalars['Int'];
  limit: Scalars['Int'];
  items: Array<Maybe<ContentfulAppConfig>>;
}

export interface ContentfulAppConfigFilter {
  sys?: InputMaybe<ContentfulSysFilter>;
  contentfulMetadata?: InputMaybe<ContentfulContentfulMetadataFilter>;
  name_exists?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  name_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  privacyPolicy_exists?: InputMaybe<Scalars['Boolean']>;
  privacyPolicy?: InputMaybe<Scalars['String']>;
  privacyPolicy_not?: InputMaybe<Scalars['String']>;
  privacyPolicy_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  privacyPolicy_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  privacyPolicy_contains?: InputMaybe<Scalars['String']>;
  privacyPolicy_not_contains?: InputMaybe<Scalars['String']>;
  termsAndConditions_exists?: InputMaybe<Scalars['Boolean']>;
  termsAndConditions?: InputMaybe<Scalars['String']>;
  termsAndConditions_not?: InputMaybe<Scalars['String']>;
  termsAndConditions_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  termsAndConditions_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  termsAndConditions_contains?: InputMaybe<Scalars['String']>;
  termsAndConditions_not_contains?: InputMaybe<Scalars['String']>;
  OR?: InputMaybe<Array<InputMaybe<ContentfulAppConfigFilter>>>;
  AND?: InputMaybe<Array<InputMaybe<ContentfulAppConfigFilter>>>;
}

export interface ContentfulAppConfigLinkingCollections {
  __typename?: 'AppConfigLinkingCollections';
  entryCollection?: Maybe<ContentfulEntryCollection>;
}


export interface ContentfulAppConfigLinkingCollectionsEntryCollectionArgs {
  skip?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
}

export enum ContentfulAppConfigOrder {
  NAME_ASC = 'name_ASC',
  NAME_DESC = 'name_DESC',
  SYS_ID_ASC = 'sys_id_ASC',
  SYS_ID_DESC = 'sys_id_DESC',
  SYS_PUBLISHEDAT_ASC = 'sys_publishedAt_ASC',
  SYS_PUBLISHEDAT_DESC = 'sys_publishedAt_DESC',
  SYS_FIRSTPUBLISHEDAT_ASC = 'sys_firstPublishedAt_ASC',
  SYS_FIRSTPUBLISHEDAT_DESC = 'sys_firstPublishedAt_DESC',
  SYS_PUBLISHEDVERSION_ASC = 'sys_publishedVersion_ASC',
  SYS_PUBLISHEDVERSION_DESC = 'sys_publishedVersion_DESC'
}

/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAsset {
  __typename?: 'Asset';
  sys: ContentfulSys;
  contentfulMetadata: ContentfulContentfulMetadata;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  contentType?: Maybe<Scalars['String']>;
  fileName?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['Int']>;
  url?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Int']>;
  height?: Maybe<Scalars['Int']>;
  linkedFrom?: Maybe<ContentfulAssetLinkingCollections>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetTitleArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetDescriptionArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetContentTypeArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetFileNameArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetSizeArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetUrlArgs {
  transform?: InputMaybe<ContentfulImageTransformOptions>;
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetWidthArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetHeightArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetLinkedFromArgs {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
}

export interface ContentfulAssetCollection {
  __typename?: 'AssetCollection';
  total: Scalars['Int'];
  skip: Scalars['Int'];
  limit: Scalars['Int'];
  items: Array<Maybe<ContentfulAsset>>;
}

export interface ContentfulAssetFilter {
  sys?: InputMaybe<ContentfulSysFilter>;
  contentfulMetadata?: InputMaybe<ContentfulContentfulMetadataFilter>;
  title_exists?: InputMaybe<Scalars['Boolean']>;
  title?: InputMaybe<Scalars['String']>;
  title_not?: InputMaybe<Scalars['String']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title_contains?: InputMaybe<Scalars['String']>;
  title_not_contains?: InputMaybe<Scalars['String']>;
  description_exists?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  description_not?: InputMaybe<Scalars['String']>;
  description_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  description_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  description_contains?: InputMaybe<Scalars['String']>;
  description_not_contains?: InputMaybe<Scalars['String']>;
  url_exists?: InputMaybe<Scalars['Boolean']>;
  url?: InputMaybe<Scalars['String']>;
  url_not?: InputMaybe<Scalars['String']>;
  url_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  url_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  url_contains?: InputMaybe<Scalars['String']>;
  url_not_contains?: InputMaybe<Scalars['String']>;
  size_exists?: InputMaybe<Scalars['Boolean']>;
  size?: InputMaybe<Scalars['Int']>;
  size_not?: InputMaybe<Scalars['Int']>;
  size_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  size_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  size_gt?: InputMaybe<Scalars['Int']>;
  size_gte?: InputMaybe<Scalars['Int']>;
  size_lt?: InputMaybe<Scalars['Int']>;
  size_lte?: InputMaybe<Scalars['Int']>;
  contentType_exists?: InputMaybe<Scalars['Boolean']>;
  contentType?: InputMaybe<Scalars['String']>;
  contentType_not?: InputMaybe<Scalars['String']>;
  contentType_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  contentType_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  contentType_contains?: InputMaybe<Scalars['String']>;
  contentType_not_contains?: InputMaybe<Scalars['String']>;
  fileName_exists?: InputMaybe<Scalars['Boolean']>;
  fileName?: InputMaybe<Scalars['String']>;
  fileName_not?: InputMaybe<Scalars['String']>;
  fileName_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  fileName_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  fileName_contains?: InputMaybe<Scalars['String']>;
  fileName_not_contains?: InputMaybe<Scalars['String']>;
  width_exists?: InputMaybe<Scalars['Boolean']>;
  width?: InputMaybe<Scalars['Int']>;
  width_not?: InputMaybe<Scalars['Int']>;
  width_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  width_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  width_gt?: InputMaybe<Scalars['Int']>;
  width_gte?: InputMaybe<Scalars['Int']>;
  width_lt?: InputMaybe<Scalars['Int']>;
  width_lte?: InputMaybe<Scalars['Int']>;
  height_exists?: InputMaybe<Scalars['Boolean']>;
  height?: InputMaybe<Scalars['Int']>;
  height_not?: InputMaybe<Scalars['Int']>;
  height_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  height_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  height_gt?: InputMaybe<Scalars['Int']>;
  height_gte?: InputMaybe<Scalars['Int']>;
  height_lt?: InputMaybe<Scalars['Int']>;
  height_lte?: InputMaybe<Scalars['Int']>;
  OR?: InputMaybe<Array<InputMaybe<ContentfulAssetFilter>>>;
  AND?: InputMaybe<Array<InputMaybe<ContentfulAssetFilter>>>;
}

export interface ContentfulAssetLinkingCollections {
  __typename?: 'AssetLinkingCollections';
  entryCollection?: Maybe<ContentfulEntryCollection>;
  demoItemCollection?: Maybe<ContentfulDemoItemCollection>;
}


export interface ContentfulAssetLinkingCollectionsEntryCollectionArgs {
  skip?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
}


export interface ContentfulAssetLinkingCollectionsDemoItemCollectionArgs {
  skip?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
}

export enum ContentfulAssetOrder {
  URL_ASC = 'url_ASC',
  URL_DESC = 'url_DESC',
  SIZE_ASC = 'size_ASC',
  SIZE_DESC = 'size_DESC',
  CONTENTTYPE_ASC = 'contentType_ASC',
  CONTENTTYPE_DESC = 'contentType_DESC',
  FILENAME_ASC = 'fileName_ASC',
  FILENAME_DESC = 'fileName_DESC',
  WIDTH_ASC = 'width_ASC',
  WIDTH_DESC = 'width_DESC',
  HEIGHT_ASC = 'height_ASC',
  HEIGHT_DESC = 'height_DESC',
  SYS_ID_ASC = 'sys_id_ASC',
  SYS_ID_DESC = 'sys_id_DESC',
  SYS_PUBLISHEDAT_ASC = 'sys_publishedAt_ASC',
  SYS_PUBLISHEDAT_DESC = 'sys_publishedAt_DESC',
  SYS_FIRSTPUBLISHEDAT_ASC = 'sys_firstPublishedAt_ASC',
  SYS_FIRSTPUBLISHEDAT_DESC = 'sys_firstPublishedAt_DESC',
  SYS_PUBLISHEDVERSION_ASC = 'sys_publishedVersion_ASC',
  SYS_PUBLISHEDVERSION_DESC = 'sys_publishedVersion_DESC'
}

export interface ContentfulContentfulMetadata {
  __typename?: 'ContentfulMetadata';
  tags: Array<Maybe<ContentfulContentfulTag>>;
}

export interface ContentfulContentfulMetadataFilter {
  tags_exists?: InputMaybe<Scalars['Boolean']>;
  tags?: InputMaybe<ContentfulContentfulMetadataTagsFilter>;
}

export interface ContentfulContentfulMetadataTagsFilter {
  id_contains_all?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_contains_some?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_contains_none?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
}

/**
 * Represents a tag entity for finding and organizing content easily.
 *     Find out more here: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/content-tags
 */
export interface ContentfulContentfulTag {
  __typename?: 'ContentfulTag';
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
}

/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItem extends ContentfulEntry {
  __typename?: 'DemoItem';
  sys: ContentfulSys;
  contentfulMetadata: ContentfulContentfulMetadata;
  linkedFrom?: Maybe<ContentfulDemoItemLinkingCollections>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  image?: Maybe<ContentfulAsset>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItemLinkedFromArgs {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItemTitleArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItemDescriptionArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItemImageArgs {
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
}

export interface ContentfulDemoItemCollection {
  __typename?: 'DemoItemCollection';
  total: Scalars['Int'];
  skip: Scalars['Int'];
  limit: Scalars['Int'];
  items: Array<Maybe<ContentfulDemoItem>>;
}

export interface ContentfulDemoItemFilter {
  sys?: InputMaybe<ContentfulSysFilter>;
  contentfulMetadata?: InputMaybe<ContentfulContentfulMetadataFilter>;
  title_exists?: InputMaybe<Scalars['Boolean']>;
  title?: InputMaybe<Scalars['String']>;
  title_not?: InputMaybe<Scalars['String']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title_contains?: InputMaybe<Scalars['String']>;
  title_not_contains?: InputMaybe<Scalars['String']>;
  description_exists?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  description_not?: InputMaybe<Scalars['String']>;
  description_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  description_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  description_contains?: InputMaybe<Scalars['String']>;
  description_not_contains?: InputMaybe<Scalars['String']>;
  image_exists?: InputMaybe<Scalars['Boolean']>;
  OR?: InputMaybe<Array<InputMaybe<ContentfulDemoItemFilter>>>;
  AND?: InputMaybe<Array<InputMaybe<ContentfulDemoItemFilter>>>;
}

export interface ContentfulDemoItemLinkingCollections {
  __typename?: 'DemoItemLinkingCollections';
  entryCollection?: Maybe<ContentfulEntryCollection>;
}


export interface ContentfulDemoItemLinkingCollectionsEntryCollectionArgs {
  skip?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
}

export enum ContentfulDemoItemOrder {
  TITLE_ASC = 'title_ASC',
  TITLE_DESC = 'title_DESC',
  SYS_ID_ASC = 'sys_id_ASC',
  SYS_ID_DESC = 'sys_id_DESC',
  SYS_PUBLISHEDAT_ASC = 'sys_publishedAt_ASC',
  SYS_PUBLISHEDAT_DESC = 'sys_publishedAt_DESC',
  SYS_FIRSTPUBLISHEDAT_ASC = 'sys_firstPublishedAt_ASC',
  SYS_FIRSTPUBLISHEDAT_DESC = 'sys_firstPublishedAt_DESC',
  SYS_PUBLISHEDVERSION_ASC = 'sys_publishedVersion_ASC',
  SYS_PUBLISHEDVERSION_DESC = 'sys_publishedVersion_DESC'
}

export interface ContentfulEntry {
  sys: ContentfulSys;
  contentfulMetadata: ContentfulContentfulMetadata;
}

export interface ContentfulEntryCollection {
  __typename?: 'EntryCollection';
  total: Scalars['Int'];
  skip: Scalars['Int'];
  limit: Scalars['Int'];
  items: Array<Maybe<ContentfulEntry>>;
}

export interface ContentfulEntryFilter {
  sys?: InputMaybe<ContentfulSysFilter>;
  contentfulMetadata?: InputMaybe<ContentfulContentfulMetadataFilter>;
  OR?: InputMaybe<Array<InputMaybe<ContentfulEntryFilter>>>;
  AND?: InputMaybe<Array<InputMaybe<ContentfulEntryFilter>>>;
}

export enum ContentfulEntryOrder {
  SYS_ID_ASC = 'sys_id_ASC',
  SYS_ID_DESC = 'sys_id_DESC',
  SYS_PUBLISHEDAT_ASC = 'sys_publishedAt_ASC',
  SYS_PUBLISHEDAT_DESC = 'sys_publishedAt_DESC',
  SYS_FIRSTPUBLISHEDAT_ASC = 'sys_firstPublishedAt_ASC',
  SYS_FIRSTPUBLISHEDAT_DESC = 'sys_firstPublishedAt_DESC',
  SYS_PUBLISHEDVERSION_ASC = 'sys_publishedVersion_ASC',
  SYS_PUBLISHEDVERSION_DESC = 'sys_publishedVersion_DESC'
}

export enum ContentfulImageFormat {
  /** JPG image format. */
  JPG = 'JPG',
  /**
   * Progressive JPG format stores multiple passes of an image in progressively higher detail.
   *         When a progressive image is loading, the viewer will first see a lower quality pixelated version which
   *         will gradually improve in detail, until the image is fully downloaded. This is to display an image as
   *         early as possible to make the layout look as designed.
   */
  JPG_PROGRESSIVE = 'JPG_PROGRESSIVE',
  /** PNG image format */
  PNG = 'PNG',
  /**
   * 8-bit PNG images support up to 256 colors and weigh less than the standard 24-bit PNG equivalent.
   *         The 8-bit PNG format is mostly used for simple images, such as icons or logos.
   */
  PNG8 = 'PNG8',
  /** WebP image format. */
  WEBP = 'WEBP',
  AVIF = 'AVIF'
}

export enum ContentfulImageResizeFocus {
  /** Focus the resizing on the center. */
  CENTER = 'CENTER',
  /** Focus the resizing on the top. */
  TOP = 'TOP',
  /** Focus the resizing on the top right. */
  TOP_RIGHT = 'TOP_RIGHT',
  /** Focus the resizing on the right. */
  RIGHT = 'RIGHT',
  /** Focus the resizing on the bottom right. */
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  /** Focus the resizing on the bottom. */
  BOTTOM = 'BOTTOM',
  /** Focus the resizing on the bottom left. */
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  /** Focus the resizing on the left. */
  LEFT = 'LEFT',
  /** Focus the resizing on the top left. */
  TOP_LEFT = 'TOP_LEFT',
  /** Focus the resizing on the largest face. */
  FACE = 'FACE',
  /** Focus the resizing on the area containing all the faces. */
  FACES = 'FACES'
}

export enum ContentfulImageResizeStrategy {
  /** Resizes the image to fit into the specified dimensions. */
  FIT = 'FIT',
  /**
   * Resizes the image to the specified dimensions, padding the image if needed.
   *         Uses desired background color as padding color.
   */
  PAD = 'PAD',
  /** Resizes the image to the specified dimensions, cropping the image if needed. */
  FILL = 'FILL',
  /** Resizes the image to the specified dimensions, changing the original aspect ratio if needed. */
  SCALE = 'SCALE',
  /** Crops a part of the original image to fit into the specified dimensions. */
  CROP = 'CROP',
  /** Creates a thumbnail from the image. */
  THUMB = 'THUMB'
}

export interface ContentfulImageTransformOptions {
  /** Desired width in pixels. Defaults to the original image width. */
  width?: InputMaybe<Scalars['Dimension']>;
  /** Desired height in pixels. Defaults to the original image height. */
  height?: InputMaybe<Scalars['Dimension']>;
  /**
   * Desired quality of the image in percents.
   *         Used for `PNG8`, `JPG`, `JPG_PROGRESSIVE` and `WEBP` formats.
   */
  quality?: InputMaybe<Scalars['Quality']>;
  /**
   * Desired corner radius in pixels.
   *         Results in an image with rounded corners (pass `-1` for a full circle/ellipse).
   *         Defaults to `0`. Uses desired background color as padding color,
   *         unless the format is `JPG` or `JPG_PROGRESSIVE` and resize strategy is `PAD`, then defaults to white.
   */
  cornerRadius?: InputMaybe<Scalars['Int']>;
  /** Desired resize strategy. Defaults to `FIT`. */
  resizeStrategy?: InputMaybe<ContentfulImageResizeStrategy>;
  /** Desired resize focus area. Defaults to `CENTER`. */
  resizeFocus?: InputMaybe<ContentfulImageResizeFocus>;
  /**
   * Desired background color, used with corner radius or `PAD` resize strategy.
   *         Defaults to transparent (for `PNG`, `PNG8` and `WEBP`) or white (for `JPG` and `JPG_PROGRESSIVE`).
   */
  backgroundColor?: InputMaybe<Scalars['HexColor']>;
  /** Desired image format. Defaults to the original image format. */
  format?: InputMaybe<ContentfulImageFormat>;
}

export interface ContentfulQuery {
  __typename?: 'Query';
  asset?: Maybe<ContentfulAsset>;
  assetCollection?: Maybe<ContentfulAssetCollection>;
  demoItem?: Maybe<ContentfulDemoItem>;
  demoItemCollection?: Maybe<ContentfulDemoItemCollection>;
  appConfig?: Maybe<ContentfulAppConfig>;
  appConfigCollection?: Maybe<ContentfulAppConfigCollection>;
  entryCollection?: Maybe<ContentfulEntryCollection>;
}


export interface ContentfulQueryAssetArgs {
  id: Scalars['String'];
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
}


export interface ContentfulQueryAssetCollectionArgs {
  skip?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ContentfulAssetFilter>;
  order?: InputMaybe<Array<InputMaybe<ContentfulAssetOrder>>>;
}


export interface ContentfulQueryDemoItemArgs {
  id: Scalars['String'];
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
}


export interface ContentfulQueryDemoItemCollectionArgs {
  skip?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ContentfulDemoItemFilter>;
  order?: InputMaybe<Array<InputMaybe<ContentfulDemoItemOrder>>>;
}


export interface ContentfulQueryAppConfigArgs {
  id: Scalars['String'];
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
}


export interface ContentfulQueryAppConfigCollectionArgs {
  skip?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ContentfulAppConfigFilter>;
  order?: InputMaybe<Array<InputMaybe<ContentfulAppConfigOrder>>>;
}


export interface ContentfulQueryEntryCollectionArgs {
  skip?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  locale?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ContentfulEntryFilter>;
  order?: InputMaybe<Array<InputMaybe<ContentfulEntryOrder>>>;
}

export interface ContentfulSys {
  __typename?: 'Sys';
  id: Scalars['String'];
  spaceId: Scalars['String'];
  environmentId: Scalars['String'];
  publishedAt?: Maybe<Scalars['DateTime']>;
  firstPublishedAt?: Maybe<Scalars['DateTime']>;
  publishedVersion?: Maybe<Scalars['Int']>;
}

export interface ContentfulSysFilter {
  id_exists?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  publishedAt_exists?: InputMaybe<Scalars['Boolean']>;
  publishedAt?: InputMaybe<Scalars['DateTime']>;
  publishedAt_not?: InputMaybe<Scalars['DateTime']>;
  publishedAt_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
  publishedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
  publishedAt_gt?: InputMaybe<Scalars['DateTime']>;
  publishedAt_gte?: InputMaybe<Scalars['DateTime']>;
  publishedAt_lt?: InputMaybe<Scalars['DateTime']>;
  publishedAt_lte?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_exists?: InputMaybe<Scalars['Boolean']>;
  firstPublishedAt?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_not?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
  firstPublishedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
  firstPublishedAt_gt?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_gte?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_lt?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_lte?: InputMaybe<Scalars['DateTime']>;
  publishedVersion_exists?: InputMaybe<Scalars['Boolean']>;
  publishedVersion?: InputMaybe<Scalars['Float']>;
  publishedVersion_not?: InputMaybe<Scalars['Float']>;
  publishedVersion_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  publishedVersion_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  publishedVersion_gt?: InputMaybe<Scalars['Float']>;
  publishedVersion_gte?: InputMaybe<Scalars['Float']>;
  publishedVersion_lt?: InputMaybe<Scalars['Float']>;
  publishedVersion_lte?: InputMaybe<Scalars['Float']>;
}
