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
  contentfulMetadata: ContentfulContentfulMetadata;
  linkedFrom?: Maybe<ContentfulAppConfigLinkingCollections>;
  name?: Maybe<Scalars['String']>;
  privacyPolicy?: Maybe<Scalars['String']>;
  sys: ContentfulSys;
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
  items: Array<Maybe<ContentfulAppConfig>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
}

export interface ContentfulAppConfigFilter {
  AND?: InputMaybe<Array<InputMaybe<ContentfulAppConfigFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ContentfulAppConfigFilter>>>;
  contentfulMetadata?: InputMaybe<ContentfulContentfulMetadataFilter>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_exists?: InputMaybe<Scalars['Boolean']>;
  name_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  privacyPolicy?: InputMaybe<Scalars['String']>;
  privacyPolicy_contains?: InputMaybe<Scalars['String']>;
  privacyPolicy_exists?: InputMaybe<Scalars['Boolean']>;
  privacyPolicy_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  privacyPolicy_not?: InputMaybe<Scalars['String']>;
  privacyPolicy_not_contains?: InputMaybe<Scalars['String']>;
  privacyPolicy_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  sys?: InputMaybe<ContentfulSysFilter>;
  termsAndConditions?: InputMaybe<Scalars['String']>;
  termsAndConditions_contains?: InputMaybe<Scalars['String']>;
  termsAndConditions_exists?: InputMaybe<Scalars['Boolean']>;
  termsAndConditions_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  termsAndConditions_not?: InputMaybe<Scalars['String']>;
  termsAndConditions_not_contains?: InputMaybe<Scalars['String']>;
  termsAndConditions_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
}

export interface ContentfulAppConfigLinkingCollections {
  __typename?: 'AppConfigLinkingCollections';
  entryCollection?: Maybe<ContentfulEntryCollection>;
}


export interface ContentfulAppConfigLinkingCollectionsEntryCollectionArgs {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
}

export enum ContentfulAppConfigOrder {
  NAME_ASC = 'name_ASC',
  NAME_DESC = 'name_DESC',
  SYS_FIRSTPUBLISHEDAT_ASC = 'sys_firstPublishedAt_ASC',
  SYS_FIRSTPUBLISHEDAT_DESC = 'sys_firstPublishedAt_DESC',
  SYS_ID_ASC = 'sys_id_ASC',
  SYS_ID_DESC = 'sys_id_DESC',
  SYS_PUBLISHEDAT_ASC = 'sys_publishedAt_ASC',
  SYS_PUBLISHEDAT_DESC = 'sys_publishedAt_DESC',
  SYS_PUBLISHEDVERSION_ASC = 'sys_publishedVersion_ASC',
  SYS_PUBLISHEDVERSION_DESC = 'sys_publishedVersion_DESC'
}

/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAsset {
  __typename?: 'Asset';
  contentType?: Maybe<Scalars['String']>;
  contentfulMetadata: ContentfulContentfulMetadata;
  description?: Maybe<Scalars['String']>;
  fileName?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Int']>;
  linkedFrom?: Maybe<ContentfulAssetLinkingCollections>;
  size?: Maybe<Scalars['Int']>;
  sys: ContentfulSys;
  title?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Int']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetContentTypeArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetDescriptionArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetFileNameArgs {
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


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetSizeArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetTitleArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetUrlArgs {
  locale?: InputMaybe<Scalars['String']>;
  transform?: InputMaybe<ContentfulImageTransformOptions>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetWidthArgs {
  locale?: InputMaybe<Scalars['String']>;
}

export interface ContentfulAssetCollection {
  __typename?: 'AssetCollection';
  items: Array<Maybe<ContentfulAsset>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
}

export interface ContentfulAssetFilter {
  AND?: InputMaybe<Array<InputMaybe<ContentfulAssetFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ContentfulAssetFilter>>>;
  contentType?: InputMaybe<Scalars['String']>;
  contentType_contains?: InputMaybe<Scalars['String']>;
  contentType_exists?: InputMaybe<Scalars['Boolean']>;
  contentType_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  contentType_not?: InputMaybe<Scalars['String']>;
  contentType_not_contains?: InputMaybe<Scalars['String']>;
  contentType_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  contentfulMetadata?: InputMaybe<ContentfulContentfulMetadataFilter>;
  description?: InputMaybe<Scalars['String']>;
  description_contains?: InputMaybe<Scalars['String']>;
  description_exists?: InputMaybe<Scalars['Boolean']>;
  description_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  description_not?: InputMaybe<Scalars['String']>;
  description_not_contains?: InputMaybe<Scalars['String']>;
  description_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  fileName?: InputMaybe<Scalars['String']>;
  fileName_contains?: InputMaybe<Scalars['String']>;
  fileName_exists?: InputMaybe<Scalars['Boolean']>;
  fileName_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  fileName_not?: InputMaybe<Scalars['String']>;
  fileName_not_contains?: InputMaybe<Scalars['String']>;
  fileName_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  height?: InputMaybe<Scalars['Int']>;
  height_exists?: InputMaybe<Scalars['Boolean']>;
  height_gt?: InputMaybe<Scalars['Int']>;
  height_gte?: InputMaybe<Scalars['Int']>;
  height_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  height_lt?: InputMaybe<Scalars['Int']>;
  height_lte?: InputMaybe<Scalars['Int']>;
  height_not?: InputMaybe<Scalars['Int']>;
  height_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  size?: InputMaybe<Scalars['Int']>;
  size_exists?: InputMaybe<Scalars['Boolean']>;
  size_gt?: InputMaybe<Scalars['Int']>;
  size_gte?: InputMaybe<Scalars['Int']>;
  size_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  size_lt?: InputMaybe<Scalars['Int']>;
  size_lte?: InputMaybe<Scalars['Int']>;
  size_not?: InputMaybe<Scalars['Int']>;
  size_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  sys?: InputMaybe<ContentfulSysFilter>;
  title?: InputMaybe<Scalars['String']>;
  title_contains?: InputMaybe<Scalars['String']>;
  title_exists?: InputMaybe<Scalars['Boolean']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title_not?: InputMaybe<Scalars['String']>;
  title_not_contains?: InputMaybe<Scalars['String']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  url?: InputMaybe<Scalars['String']>;
  url_contains?: InputMaybe<Scalars['String']>;
  url_exists?: InputMaybe<Scalars['Boolean']>;
  url_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  url_not?: InputMaybe<Scalars['String']>;
  url_not_contains?: InputMaybe<Scalars['String']>;
  url_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  width?: InputMaybe<Scalars['Int']>;
  width_exists?: InputMaybe<Scalars['Boolean']>;
  width_gt?: InputMaybe<Scalars['Int']>;
  width_gte?: InputMaybe<Scalars['Int']>;
  width_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  width_lt?: InputMaybe<Scalars['Int']>;
  width_lte?: InputMaybe<Scalars['Int']>;
  width_not?: InputMaybe<Scalars['Int']>;
  width_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
}

export interface ContentfulAssetLinkingCollections {
  __typename?: 'AssetLinkingCollections';
  demoItemCollection?: Maybe<ContentfulDemoItemCollection>;
  entryCollection?: Maybe<ContentfulEntryCollection>;
}


export interface ContentfulAssetLinkingCollectionsDemoItemCollectionArgs {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
}


export interface ContentfulAssetLinkingCollectionsEntryCollectionArgs {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
}

export enum ContentfulAssetOrder {
  CONTENTTYPE_ASC = 'contentType_ASC',
  CONTENTTYPE_DESC = 'contentType_DESC',
  FILENAME_ASC = 'fileName_ASC',
  FILENAME_DESC = 'fileName_DESC',
  HEIGHT_ASC = 'height_ASC',
  HEIGHT_DESC = 'height_DESC',
  SIZE_ASC = 'size_ASC',
  SIZE_DESC = 'size_DESC',
  SYS_FIRSTPUBLISHEDAT_ASC = 'sys_firstPublishedAt_ASC',
  SYS_FIRSTPUBLISHEDAT_DESC = 'sys_firstPublishedAt_DESC',
  SYS_ID_ASC = 'sys_id_ASC',
  SYS_ID_DESC = 'sys_id_DESC',
  SYS_PUBLISHEDAT_ASC = 'sys_publishedAt_ASC',
  SYS_PUBLISHEDAT_DESC = 'sys_publishedAt_DESC',
  SYS_PUBLISHEDVERSION_ASC = 'sys_publishedVersion_ASC',
  SYS_PUBLISHEDVERSION_DESC = 'sys_publishedVersion_DESC',
  URL_ASC = 'url_ASC',
  URL_DESC = 'url_DESC',
  WIDTH_ASC = 'width_ASC',
  WIDTH_DESC = 'width_DESC'
}

export interface ContentfulContentfulMetadata {
  __typename?: 'ContentfulMetadata';
  tags: Array<Maybe<ContentfulContentfulTag>>;
}

export interface ContentfulContentfulMetadataFilter {
  tags?: InputMaybe<ContentfulContentfulMetadataTagsFilter>;
  tags_exists?: InputMaybe<Scalars['Boolean']>;
}

export interface ContentfulContentfulMetadataTagsFilter {
  id_contains_all?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_contains_none?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_contains_some?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
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
  contentfulMetadata: ContentfulContentfulMetadata;
  description?: Maybe<Scalars['String']>;
  image?: Maybe<ContentfulAsset>;
  linkedFrom?: Maybe<ContentfulDemoItemLinkingCollections>;
  sys: ContentfulSys;
  title?: Maybe<Scalars['String']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItemDescriptionArgs {
  locale?: InputMaybe<Scalars['String']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItemImageArgs {
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItemLinkedFromArgs {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItemTitleArgs {
  locale?: InputMaybe<Scalars['String']>;
}

export interface ContentfulDemoItemCollection {
  __typename?: 'DemoItemCollection';
  items: Array<Maybe<ContentfulDemoItem>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
}

export interface ContentfulDemoItemFilter {
  AND?: InputMaybe<Array<InputMaybe<ContentfulDemoItemFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ContentfulDemoItemFilter>>>;
  contentfulMetadata?: InputMaybe<ContentfulContentfulMetadataFilter>;
  description?: InputMaybe<Scalars['String']>;
  description_contains?: InputMaybe<Scalars['String']>;
  description_exists?: InputMaybe<Scalars['Boolean']>;
  description_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  description_not?: InputMaybe<Scalars['String']>;
  description_not_contains?: InputMaybe<Scalars['String']>;
  description_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  image_exists?: InputMaybe<Scalars['Boolean']>;
  sys?: InputMaybe<ContentfulSysFilter>;
  title?: InputMaybe<Scalars['String']>;
  title_contains?: InputMaybe<Scalars['String']>;
  title_exists?: InputMaybe<Scalars['Boolean']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title_not?: InputMaybe<Scalars['String']>;
  title_not_contains?: InputMaybe<Scalars['String']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
}

export interface ContentfulDemoItemLinkingCollections {
  __typename?: 'DemoItemLinkingCollections';
  entryCollection?: Maybe<ContentfulEntryCollection>;
}


export interface ContentfulDemoItemLinkingCollectionsEntryCollectionArgs {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
}

export enum ContentfulDemoItemOrder {
  SYS_FIRSTPUBLISHEDAT_ASC = 'sys_firstPublishedAt_ASC',
  SYS_FIRSTPUBLISHEDAT_DESC = 'sys_firstPublishedAt_DESC',
  SYS_ID_ASC = 'sys_id_ASC',
  SYS_ID_DESC = 'sys_id_DESC',
  SYS_PUBLISHEDAT_ASC = 'sys_publishedAt_ASC',
  SYS_PUBLISHEDAT_DESC = 'sys_publishedAt_DESC',
  SYS_PUBLISHEDVERSION_ASC = 'sys_publishedVersion_ASC',
  SYS_PUBLISHEDVERSION_DESC = 'sys_publishedVersion_DESC',
  TITLE_ASC = 'title_ASC',
  TITLE_DESC = 'title_DESC'
}

export interface ContentfulEntry {
  contentfulMetadata: ContentfulContentfulMetadata;
  sys: ContentfulSys;
}

export interface ContentfulEntryCollection {
  __typename?: 'EntryCollection';
  items: Array<Maybe<ContentfulEntry>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
}

export interface ContentfulEntryFilter {
  AND?: InputMaybe<Array<InputMaybe<ContentfulEntryFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ContentfulEntryFilter>>>;
  contentfulMetadata?: InputMaybe<ContentfulContentfulMetadataFilter>;
  sys?: InputMaybe<ContentfulSysFilter>;
}

export enum ContentfulEntryOrder {
  SYS_FIRSTPUBLISHEDAT_ASC = 'sys_firstPublishedAt_ASC',
  SYS_FIRSTPUBLISHEDAT_DESC = 'sys_firstPublishedAt_DESC',
  SYS_ID_ASC = 'sys_id_ASC',
  SYS_ID_DESC = 'sys_id_DESC',
  SYS_PUBLISHEDAT_ASC = 'sys_publishedAt_ASC',
  SYS_PUBLISHEDAT_DESC = 'sys_publishedAt_DESC',
  SYS_PUBLISHEDVERSION_ASC = 'sys_publishedVersion_ASC',
  SYS_PUBLISHEDVERSION_DESC = 'sys_publishedVersion_DESC'
}

export enum ContentfulImageFormat {
  AVIF = 'AVIF',
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
  WEBP = 'WEBP'
}

export enum ContentfulImageResizeFocus {
  /** Focus the resizing on the bottom. */
  BOTTOM = 'BOTTOM',
  /** Focus the resizing on the bottom left. */
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  /** Focus the resizing on the bottom right. */
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  /** Focus the resizing on the center. */
  CENTER = 'CENTER',
  /** Focus the resizing on the largest face. */
  FACE = 'FACE',
  /** Focus the resizing on the area containing all the faces. */
  FACES = 'FACES',
  /** Focus the resizing on the left. */
  LEFT = 'LEFT',
  /** Focus the resizing on the right. */
  RIGHT = 'RIGHT',
  /** Focus the resizing on the top. */
  TOP = 'TOP',
  /** Focus the resizing on the top left. */
  TOP_LEFT = 'TOP_LEFT',
  /** Focus the resizing on the top right. */
  TOP_RIGHT = 'TOP_RIGHT'
}

export enum ContentfulImageResizeStrategy {
  /** Crops a part of the original image to fit into the specified dimensions. */
  CROP = 'CROP',
  /** Resizes the image to the specified dimensions, cropping the image if needed. */
  FILL = 'FILL',
  /** Resizes the image to fit into the specified dimensions. */
  FIT = 'FIT',
  /**
   * Resizes the image to the specified dimensions, padding the image if needed.
   *         Uses desired background color as padding color.
   */
  PAD = 'PAD',
  /** Resizes the image to the specified dimensions, changing the original aspect ratio if needed. */
  SCALE = 'SCALE',
  /** Creates a thumbnail from the image. */
  THUMB = 'THUMB'
}

export interface ContentfulImageTransformOptions {
  /**
   * Desired background color, used with corner radius or `PAD` resize strategy.
   *         Defaults to transparent (for `PNG`, `PNG8` and `WEBP`) or white (for `JPG` and `JPG_PROGRESSIVE`).
   */
  backgroundColor?: InputMaybe<Scalars['HexColor']>;
  /**
   * Desired corner radius in pixels.
   *         Results in an image with rounded corners (pass `-1` for a full circle/ellipse).
   *         Defaults to `0`. Uses desired background color as padding color,
   *         unless the format is `JPG` or `JPG_PROGRESSIVE` and resize strategy is `PAD`, then defaults to white.
   */
  cornerRadius?: InputMaybe<Scalars['Int']>;
  /** Desired image format. Defaults to the original image format. */
  format?: InputMaybe<ContentfulImageFormat>;
  /** Desired height in pixels. Defaults to the original image height. */
  height?: InputMaybe<Scalars['Dimension']>;
  /**
   * Desired quality of the image in percents.
   *         Used for `PNG8`, `JPG`, `JPG_PROGRESSIVE` and `WEBP` formats.
   */
  quality?: InputMaybe<Scalars['Quality']>;
  /** Desired resize focus area. Defaults to `CENTER`. */
  resizeFocus?: InputMaybe<ContentfulImageResizeFocus>;
  /** Desired resize strategy. Defaults to `FIT`. */
  resizeStrategy?: InputMaybe<ContentfulImageResizeStrategy>;
  /** Desired width in pixels. Defaults to the original image width. */
  width?: InputMaybe<Scalars['Dimension']>;
}

export interface ContentfulQuery {
  __typename?: 'Query';
  appConfig?: Maybe<ContentfulAppConfig>;
  appConfigCollection?: Maybe<ContentfulAppConfigCollection>;
  asset?: Maybe<ContentfulAsset>;
  assetCollection?: Maybe<ContentfulAssetCollection>;
  demoItem?: Maybe<ContentfulDemoItem>;
  demoItemCollection?: Maybe<ContentfulDemoItemCollection>;
  entryCollection?: Maybe<ContentfulEntryCollection>;
}


export interface ContentfulQueryAppConfigArgs {
  id: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
}


export interface ContentfulQueryAppConfigCollectionArgs {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Array<InputMaybe<ContentfulAppConfigOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<ContentfulAppConfigFilter>;
}


export interface ContentfulQueryAssetArgs {
  id: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
}


export interface ContentfulQueryAssetCollectionArgs {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Array<InputMaybe<ContentfulAssetOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<ContentfulAssetFilter>;
}


export interface ContentfulQueryDemoItemArgs {
  id: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
}


export interface ContentfulQueryDemoItemCollectionArgs {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Array<InputMaybe<ContentfulDemoItemOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<ContentfulDemoItemFilter>;
}


export interface ContentfulQueryEntryCollectionArgs {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Array<InputMaybe<ContentfulEntryOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<ContentfulEntryFilter>;
}

export interface ContentfulSys {
  __typename?: 'Sys';
  environmentId: Scalars['String'];
  firstPublishedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['String'];
  publishedAt?: Maybe<Scalars['DateTime']>;
  publishedVersion?: Maybe<Scalars['Int']>;
  spaceId: Scalars['String'];
}

export interface ContentfulSysFilter {
  firstPublishedAt?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_exists?: InputMaybe<Scalars['Boolean']>;
  firstPublishedAt_gt?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_gte?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
  firstPublishedAt_lt?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_lte?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_not?: InputMaybe<Scalars['DateTime']>;
  firstPublishedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_exists?: InputMaybe<Scalars['Boolean']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']>;
  publishedAt_exists?: InputMaybe<Scalars['Boolean']>;
  publishedAt_gt?: InputMaybe<Scalars['DateTime']>;
  publishedAt_gte?: InputMaybe<Scalars['DateTime']>;
  publishedAt_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
  publishedAt_lt?: InputMaybe<Scalars['DateTime']>;
  publishedAt_lte?: InputMaybe<Scalars['DateTime']>;
  publishedAt_not?: InputMaybe<Scalars['DateTime']>;
  publishedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
  publishedVersion?: InputMaybe<Scalars['Float']>;
  publishedVersion_exists?: InputMaybe<Scalars['Boolean']>;
  publishedVersion_gt?: InputMaybe<Scalars['Float']>;
  publishedVersion_gte?: InputMaybe<Scalars['Float']>;
  publishedVersion_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  publishedVersion_lt?: InputMaybe<Scalars['Float']>;
  publishedVersion_lte?: InputMaybe<Scalars['Float']>;
  publishedVersion_not?: InputMaybe<Scalars['Float']>;
  publishedVersion_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
}
