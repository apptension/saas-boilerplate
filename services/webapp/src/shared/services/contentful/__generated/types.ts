import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | undefined | null;
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
  allowedLocales?: Maybe<Array<Maybe<Scalars['String']>>>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export interface ContentfulAppConfigNameArgs {
  locale?: Maybe<Scalars['String']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export interface ContentfulAppConfigPrivacyPolicyArgs {
  locale?: Maybe<Scalars['String']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export interface ContentfulAppConfigTermsAndConditionsArgs {
  locale?: Maybe<Scalars['String']>;
}

export interface ContentfulAppConfigCollection {
  __typename?: 'AppConfigCollection';
  total: Scalars['Int'];
  skip: Scalars['Int'];
  limit: Scalars['Int'];
  items: Array<Maybe<ContentfulAppConfig>>;
}

export interface ContentfulAppConfigFilter {
  sys?: Maybe<ContentfulSysFilter>;
  contentfulMetadata?: Maybe<ContentfulContentfulMetadataFilter>;
  name_exists?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  privacyPolicy_exists?: Maybe<Scalars['Boolean']>;
  privacyPolicy?: Maybe<Scalars['String']>;
  privacyPolicy_not?: Maybe<Scalars['String']>;
  privacyPolicy_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  privacyPolicy_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  privacyPolicy_contains?: Maybe<Scalars['String']>;
  privacyPolicy_not_contains?: Maybe<Scalars['String']>;
  termsAndConditions_exists?: Maybe<Scalars['Boolean']>;
  termsAndConditions?: Maybe<Scalars['String']>;
  termsAndConditions_not?: Maybe<Scalars['String']>;
  termsAndConditions_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  termsAndConditions_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  termsAndConditions_contains?: Maybe<Scalars['String']>;
  termsAndConditions_not_contains?: Maybe<Scalars['String']>;
  OR?: Maybe<Array<Maybe<ContentfulAppConfigFilter>>>;
  AND?: Maybe<Array<Maybe<ContentfulAppConfigFilter>>>;
}

export interface ContentfulAppConfigLinkingCollections {
  __typename?: 'AppConfigLinkingCollections';
  entryCollection?: Maybe<ContentfulEntryCollection>;
}


export interface ContentfulAppConfigLinkingCollectionsEntryCollectionArgs {
  skip?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
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
  locale?: Maybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetDescriptionArgs {
  locale?: Maybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetContentTypeArgs {
  locale?: Maybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetFileNameArgs {
  locale?: Maybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetSizeArgs {
  locale?: Maybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetUrlArgs {
  transform?: Maybe<ContentfulImageTransformOptions>;
  locale?: Maybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetWidthArgs {
  locale?: Maybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetHeightArgs {
  locale?: Maybe<Scalars['String']>;
}


/** Represents a binary file in a space. An asset can be any file type. */
export interface ContentfulAssetLinkedFromArgs {
  allowedLocales?: Maybe<Array<Maybe<Scalars['String']>>>;
}

export interface ContentfulAssetCollection {
  __typename?: 'AssetCollection';
  total: Scalars['Int'];
  skip: Scalars['Int'];
  limit: Scalars['Int'];
  items: Array<Maybe<ContentfulAsset>>;
}

export interface ContentfulAssetFilter {
  sys?: Maybe<ContentfulSysFilter>;
  contentfulMetadata?: Maybe<ContentfulContentfulMetadataFilter>;
  title_exists?: Maybe<Scalars['Boolean']>;
  title?: Maybe<Scalars['String']>;
  title_not?: Maybe<Scalars['String']>;
  title_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  title_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  title_contains?: Maybe<Scalars['String']>;
  title_not_contains?: Maybe<Scalars['String']>;
  description_exists?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_contains?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  url_exists?: Maybe<Scalars['Boolean']>;
  url?: Maybe<Scalars['String']>;
  url_not?: Maybe<Scalars['String']>;
  url_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  url_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  url_contains?: Maybe<Scalars['String']>;
  url_not_contains?: Maybe<Scalars['String']>;
  size_exists?: Maybe<Scalars['Boolean']>;
  size?: Maybe<Scalars['Int']>;
  size_not?: Maybe<Scalars['Int']>;
  size_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  size_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  size_gt?: Maybe<Scalars['Int']>;
  size_gte?: Maybe<Scalars['Int']>;
  size_lt?: Maybe<Scalars['Int']>;
  size_lte?: Maybe<Scalars['Int']>;
  contentType_exists?: Maybe<Scalars['Boolean']>;
  contentType?: Maybe<Scalars['String']>;
  contentType_not?: Maybe<Scalars['String']>;
  contentType_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  contentType_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  contentType_contains?: Maybe<Scalars['String']>;
  contentType_not_contains?: Maybe<Scalars['String']>;
  fileName_exists?: Maybe<Scalars['Boolean']>;
  fileName?: Maybe<Scalars['String']>;
  fileName_not?: Maybe<Scalars['String']>;
  fileName_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  fileName_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  fileName_contains?: Maybe<Scalars['String']>;
  fileName_not_contains?: Maybe<Scalars['String']>;
  width_exists?: Maybe<Scalars['Boolean']>;
  width?: Maybe<Scalars['Int']>;
  width_not?: Maybe<Scalars['Int']>;
  width_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  width_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  width_gt?: Maybe<Scalars['Int']>;
  width_gte?: Maybe<Scalars['Int']>;
  width_lt?: Maybe<Scalars['Int']>;
  width_lte?: Maybe<Scalars['Int']>;
  height_exists?: Maybe<Scalars['Boolean']>;
  height?: Maybe<Scalars['Int']>;
  height_not?: Maybe<Scalars['Int']>;
  height_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  height_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  height_gt?: Maybe<Scalars['Int']>;
  height_gte?: Maybe<Scalars['Int']>;
  height_lt?: Maybe<Scalars['Int']>;
  height_lte?: Maybe<Scalars['Int']>;
  OR?: Maybe<Array<Maybe<ContentfulAssetFilter>>>;
  AND?: Maybe<Array<Maybe<ContentfulAssetFilter>>>;
}

export interface ContentfulAssetLinkingCollections {
  __typename?: 'AssetLinkingCollections';
  entryCollection?: Maybe<ContentfulEntryCollection>;
  demoItemCollection?: Maybe<ContentfulDemoItemCollection>;
}


export interface ContentfulAssetLinkingCollectionsEntryCollectionArgs {
  skip?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
}


export interface ContentfulAssetLinkingCollectionsDemoItemCollectionArgs {
  skip?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
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
  tags_exists?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<ContentfulContentfulMetadataTagsFilter>;
}

export interface ContentfulContentfulMetadataTagsFilter {
  id_contains_all?: Maybe<Array<Maybe<Scalars['String']>>>;
  id_contains_some?: Maybe<Array<Maybe<Scalars['String']>>>;
  id_contains_none?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  allowedLocales?: Maybe<Array<Maybe<Scalars['String']>>>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItemTitleArgs {
  locale?: Maybe<Scalars['String']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItemDescriptionArgs {
  locale?: Maybe<Scalars['String']>;
}


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export interface ContentfulDemoItemImageArgs {
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
}

export interface ContentfulDemoItemCollection {
  __typename?: 'DemoItemCollection';
  total: Scalars['Int'];
  skip: Scalars['Int'];
  limit: Scalars['Int'];
  items: Array<Maybe<ContentfulDemoItem>>;
}

export interface ContentfulDemoItemFilter {
  sys?: Maybe<ContentfulSysFilter>;
  contentfulMetadata?: Maybe<ContentfulContentfulMetadataFilter>;
  title_exists?: Maybe<Scalars['Boolean']>;
  title?: Maybe<Scalars['String']>;
  title_not?: Maybe<Scalars['String']>;
  title_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  title_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  title_contains?: Maybe<Scalars['String']>;
  title_not_contains?: Maybe<Scalars['String']>;
  description_exists?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_contains?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  image_exists?: Maybe<Scalars['Boolean']>;
  OR?: Maybe<Array<Maybe<ContentfulDemoItemFilter>>>;
  AND?: Maybe<Array<Maybe<ContentfulDemoItemFilter>>>;
}

export interface ContentfulDemoItemLinkingCollections {
  __typename?: 'DemoItemLinkingCollections';
  entryCollection?: Maybe<ContentfulEntryCollection>;
}


export interface ContentfulDemoItemLinkingCollectionsEntryCollectionArgs {
  skip?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
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
  sys?: Maybe<ContentfulSysFilter>;
  contentfulMetadata?: Maybe<ContentfulContentfulMetadataFilter>;
  OR?: Maybe<Array<Maybe<ContentfulEntryFilter>>>;
  AND?: Maybe<Array<Maybe<ContentfulEntryFilter>>>;
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
  width?: Maybe<Scalars['Dimension']>;
  /** Desired height in pixels. Defaults to the original image height. */
  height?: Maybe<Scalars['Dimension']>;
  /**
   * Desired quality of the image in percents.
   *         Used for `PNG8`, `JPG`, `JPG_PROGRESSIVE` and `WEBP` formats.
   */
  quality?: Maybe<Scalars['Quality']>;
  /**
   * Desired corner radius in pixels.
   *         Results in an image with rounded corners (pass `-1` for a full circle/ellipse).
   *         Defaults to `0`. Uses desired background color as padding color,
   *         unless the format is `JPG` or `JPG_PROGRESSIVE` and resize strategy is `PAD`, then defaults to white.
   */
  cornerRadius?: Maybe<Scalars['Int']>;
  /** Desired resize strategy. Defaults to `FIT`. */
  resizeStrategy?: Maybe<ContentfulImageResizeStrategy>;
  /** Desired resize focus area. Defaults to `CENTER`. */
  resizeFocus?: Maybe<ContentfulImageResizeFocus>;
  /**
   * Desired background color, used with corner radius or `PAD` resize strategy.
   *         Defaults to transparent (for `PNG`, `PNG8` and `WEBP`) or white (for `JPG` and `JPG_PROGRESSIVE`).
   */
  backgroundColor?: Maybe<Scalars['HexColor']>;
  /** Desired image format. Defaults to the original image format. */
  format?: Maybe<ContentfulImageFormat>;
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
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
}


export interface ContentfulQueryAssetCollectionArgs {
  skip?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
  where?: Maybe<ContentfulAssetFilter>;
  order?: Maybe<Array<Maybe<ContentfulAssetOrder>>>;
}


export interface ContentfulQueryDemoItemArgs {
  id: Scalars['String'];
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
}


export interface ContentfulQueryDemoItemCollectionArgs {
  skip?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
  where?: Maybe<ContentfulDemoItemFilter>;
  order?: Maybe<Array<Maybe<ContentfulDemoItemOrder>>>;
}


export interface ContentfulQueryAppConfigArgs {
  id: Scalars['String'];
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
}


export interface ContentfulQueryAppConfigCollectionArgs {
  skip?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
  where?: Maybe<ContentfulAppConfigFilter>;
  order?: Maybe<Array<Maybe<ContentfulAppConfigOrder>>>;
}


export interface ContentfulQueryEntryCollectionArgs {
  skip?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  preview?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
  where?: Maybe<ContentfulEntryFilter>;
  order?: Maybe<Array<Maybe<ContentfulEntryOrder>>>;
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
  id_exists?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['String']>;
  id_not?: Maybe<Scalars['String']>;
  id_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  id_contains?: Maybe<Scalars['String']>;
  id_not_contains?: Maybe<Scalars['String']>;
  publishedAt_exists?: Maybe<Scalars['Boolean']>;
  publishedAt?: Maybe<Scalars['DateTime']>;
  publishedAt_not?: Maybe<Scalars['DateTime']>;
  publishedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  publishedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  publishedAt_gt?: Maybe<Scalars['DateTime']>;
  publishedAt_gte?: Maybe<Scalars['DateTime']>;
  publishedAt_lt?: Maybe<Scalars['DateTime']>;
  publishedAt_lte?: Maybe<Scalars['DateTime']>;
  firstPublishedAt_exists?: Maybe<Scalars['Boolean']>;
  firstPublishedAt?: Maybe<Scalars['DateTime']>;
  firstPublishedAt_not?: Maybe<Scalars['DateTime']>;
  firstPublishedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  firstPublishedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  firstPublishedAt_gt?: Maybe<Scalars['DateTime']>;
  firstPublishedAt_gte?: Maybe<Scalars['DateTime']>;
  firstPublishedAt_lt?: Maybe<Scalars['DateTime']>;
  firstPublishedAt_lte?: Maybe<Scalars['DateTime']>;
  publishedVersion_exists?: Maybe<Scalars['Boolean']>;
  publishedVersion?: Maybe<Scalars['Float']>;
  publishedVersion_not?: Maybe<Scalars['Float']>;
  publishedVersion_in?: Maybe<Array<Maybe<Scalars['Float']>>>;
  publishedVersion_not_in?: Maybe<Array<Maybe<Scalars['Float']>>>;
  publishedVersion_gt?: Maybe<Scalars['Float']>;
  publishedVersion_gte?: Maybe<Scalars['Float']>;
  publishedVersion_lt?: Maybe<Scalars['Float']>;
  publishedVersion_lte?: Maybe<Scalars['Float']>;
}

export type ContentfulAppConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type ContentfulAppConfigQuery = (
  { __typename?: 'Query' }
  & { appConfigCollection?: Maybe<(
    { __typename?: 'AppConfigCollection' }
    & { items: Array<Maybe<(
      { __typename?: 'AppConfig' }
      & Pick<ContentfulAppConfig, 'name' | 'privacyPolicy' | 'termsAndConditions'>
    )>> }
  )> }
);

export type ContentfulAllDemoItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type ContentfulAllDemoItemsQuery = (
  { __typename?: 'Query' }
  & { demoItemCollection?: Maybe<(
    { __typename?: 'DemoItemCollection' }
    & { items: Array<Maybe<(
      { __typename?: 'DemoItem' }
      & Pick<ContentfulDemoItem, 'title'>
      & { sys: (
        { __typename?: 'Sys' }
        & Pick<ContentfulSys, 'id'>
      ), image?: Maybe<(
        { __typename?: 'Asset' }
        & Pick<ContentfulAsset, 'title' | 'url'>
      )> }
    )>> }
  )> }
);

export type ContentfulDemoItemQueryVariables = Exact<{
  itemId: Scalars['String'];
}>;


export type ContentfulDemoItemQuery = (
  { __typename?: 'Query' }
  & { demoItem?: Maybe<(
    { __typename?: 'DemoItem' }
    & Pick<ContentfulDemoItem, 'title' | 'description'>
    & { image?: Maybe<(
      { __typename?: 'Asset' }
      & Pick<ContentfulAsset, 'title' | 'url'>
    )> }
  )> }
);


export const AppConfigDocument = gql`
    query appConfig {
  appConfigCollection(limit: 1) {
    items {
      name
      privacyPolicy
      termsAndConditions
    }
  }
}
    `;
export const AllDemoItemsDocument = gql`
    query allDemoItems {
  demoItemCollection {
    items {
      sys {
        id
      }
      title
      image {
        title
        url
      }
    }
  }
}
    `;
export const DemoItemDocument = gql`
    query demoItem($itemId: String!) {
  demoItem(id: $itemId) {
    title
    description
    image {
      title
      url
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    appConfig(variables?: ContentfulAppConfigQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ContentfulAppConfigQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ContentfulAppConfigQuery>(AppConfigDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'appConfig');
    },
    allDemoItems(variables?: ContentfulAllDemoItemsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ContentfulAllDemoItemsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ContentfulAllDemoItemsQuery>(AllDemoItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'allDemoItems');
    },
    demoItem(variables: ContentfulDemoItemQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ContentfulDemoItemQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ContentfulDemoItemQuery>(DemoItemDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'demoItem');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;