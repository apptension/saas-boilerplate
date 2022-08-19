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
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: any;
  /**
   * The `GenericScalar` scalar type represents a generic
   * GraphQL scalar value that could be:
   * String, Boolean, Int, Float, List or Object.
   */
  GenericScalar: any;
  /**
   * Allows use of a JSON String for input / output from the GraphQL schema.
   *
   * Use of this type is *not recommended* as you lose the benefits of having a defined, static
   * schema (one of the key benefits of GraphQL).
   */
  JSONString: any;
  /**
   * Create scalar that ignores normal serialization/deserialization, since
   * that will be handled by the multipart request spec
   */
  Upload: any;
}

export interface ApiMutation {
  __typename?: 'ApiMutation';
  updateNotification?: Maybe<UpdateNotificationMutationPayload>;
  markReadAllNotifications?: Maybe<MarkReadAllNotificationsMutationPayload>;
  createCrudDemoItem?: Maybe<CreateCrudDemoItemMutationPayload>;
  updateCrudDemoItem?: Maybe<UpdateCrudDemoItemMutationPayload>;
  deleteCrudDemoItem?: Maybe<DeleteCrudDemoItemMutationPayload>;
  createDocumentDemoItem?: Maybe<CreateDocumentDemoItemMutationPayload>;
  deleteDocumentDemoItem?: Maybe<DeleteDocumentDemoItemMutationPayload>;
  createFavoriteContentfulDemoItem?: Maybe<CreateFavoriteContentfulDemoItemMutationPayload>;
  deleteFavoriteContentfulDemoItem?: Maybe<DeleteFavoriteContentfulDemoItemMutationPayload>;
}


export interface ApiMutationUpdateNotificationArgs {
  input: UpdateNotificationMutationInput;
}


export interface ApiMutationMarkReadAllNotificationsArgs {
  input: MarkReadAllNotificationsMutationInput;
}


export interface ApiMutationCreateCrudDemoItemArgs {
  input: CreateCrudDemoItemMutationInput;
}


export interface ApiMutationUpdateCrudDemoItemArgs {
  input: UpdateCrudDemoItemMutationInput;
}


export interface ApiMutationDeleteCrudDemoItemArgs {
  input: DeleteCrudDemoItemMutationInput;
}


export interface ApiMutationCreateDocumentDemoItemArgs {
  input: CreateDocumentDemoItemMutationInput;
}


export interface ApiMutationDeleteDocumentDemoItemArgs {
  input: DeleteDocumentDemoItemMutationInput;
}


export interface ApiMutationCreateFavoriteContentfulDemoItemArgs {
  input: CreateFavoriteContentfulDemoItemMutationInput;
}


export interface ApiMutationDeleteFavoriteContentfulDemoItemArgs {
  input: DeleteFavoriteContentfulDemoItemMutationInput;
}

export interface ApiSubscription {
  __typename?: 'ApiSubscription';
  notificationCreated?: Maybe<NotificationConnection>;
}


export interface ApiSubscriptionNotificationCreatedArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}

export interface ContentfulDemoItemFavoriteConnection {
  __typename?: 'ContentfulDemoItemFavoriteConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ContentfulDemoItemFavoriteEdge>>;
}

/** A Relay edge containing a `ContentfulDemoItemFavorite` and its cursor. */
export interface ContentfulDemoItemFavoriteEdge {
  __typename?: 'ContentfulDemoItemFavoriteEdge';
  /** The item at the end of the edge */
  node?: Maybe<ContentfulDemoItemFavoriteType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}

export interface ContentfulDemoItemFavoriteType extends Node {
  __typename?: 'ContentfulDemoItemFavoriteType';
  /** The ID of the object. */
  id: Scalars['ID'];
  item: ContentfulDemoItemType;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
}

export interface ContentfulDemoItemFavoriteTypeConnection {
  __typename?: 'ContentfulDemoItemFavoriteTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ContentfulDemoItemFavoriteTypeEdge>>;
}

/** A Relay edge containing a `ContentfulDemoItemFavoriteType` and its cursor. */
export interface ContentfulDemoItemFavoriteTypeEdge {
  __typename?: 'ContentfulDemoItemFavoriteTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<ContentfulDemoItemFavoriteType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}

export interface ContentfulDemoItemType extends Node {
  __typename?: 'ContentfulDemoItemType';
  /** The ID of the object. */
  id: Scalars['ID'];
  fields: Scalars['JSONString'];
  isPublished: Scalars['Boolean'];
  contentfuldemoitemfavoriteSet: ContentfulDemoItemFavoriteTypeConnection;
  pk?: Maybe<Scalars['String']>;
}


export interface ContentfulDemoItemTypeContentfuldemoitemfavoriteSetArgs {
  offset?: InputMaybe<Scalars['Int']>;
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}

export interface CreateCrudDemoItemMutationInput {
  name: Scalars['String'];
  createdBy?: InputMaybe<Scalars['String']>;
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface CreateCrudDemoItemMutationPayload {
  __typename?: 'CreateCrudDemoItemMutationPayload';
  crudDemoItem?: Maybe<CrudDemoItemType>;
  crudDemoItemEdge?: Maybe<CrudDemoItemEdge>;
  clientMutationId?: Maybe<Scalars['String']>;
}

export interface CreateDocumentDemoItemMutationInput {
  file?: InputMaybe<Scalars['Upload']>;
  createdBy?: InputMaybe<Scalars['String']>;
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface CreateDocumentDemoItemMutationPayload {
  __typename?: 'CreateDocumentDemoItemMutationPayload';
  documentDemoItem?: Maybe<DocumentDemoItemType>;
  documentDemoItemEdge?: Maybe<DocumentDemoItemEdge>;
  clientMutationId?: Maybe<Scalars['String']>;
}

export interface CreateFavoriteContentfulDemoItemMutationInput {
  item: Scalars['String'];
  user?: InputMaybe<Scalars['String']>;
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface CreateFavoriteContentfulDemoItemMutationPayload {
  __typename?: 'CreateFavoriteContentfulDemoItemMutationPayload';
  contentfulDemoItemFavorite?: Maybe<ContentfulDemoItemFavoriteType>;
  contentfulDemoItemFavoriteEdge?: Maybe<ContentfulDemoItemFavoriteEdge>;
  clientMutationId?: Maybe<Scalars['String']>;
}

export interface CrudDemoItemConnection {
  __typename?: 'CrudDemoItemConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<CrudDemoItemEdge>>;
}

/** A Relay edge containing a `CrudDemoItem` and its cursor. */
export interface CrudDemoItemEdge {
  __typename?: 'CrudDemoItemEdge';
  /** The item at the end of the edge */
  node?: Maybe<CrudDemoItemType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}

export interface CrudDemoItemType extends Node {
  __typename?: 'CrudDemoItemType';
  /** The ID of the object. */
  id: Scalars['ID'];
  name: Scalars['String'];
}

export interface DeleteCrudDemoItemMutationInput {
  id?: InputMaybe<Scalars['String']>;
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface DeleteCrudDemoItemMutationPayload {
  __typename?: 'DeleteCrudDemoItemMutationPayload';
  deletedIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  clientMutationId?: Maybe<Scalars['String']>;
}

export interface DeleteDocumentDemoItemMutationInput {
  id?: InputMaybe<Scalars['String']>;
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface DeleteDocumentDemoItemMutationPayload {
  __typename?: 'DeleteDocumentDemoItemMutationPayload';
  deletedIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  clientMutationId?: Maybe<Scalars['String']>;
}

export interface DeleteFavoriteContentfulDemoItemMutationInput {
  item?: InputMaybe<Scalars['String']>;
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface DeleteFavoriteContentfulDemoItemMutationPayload {
  __typename?: 'DeleteFavoriteContentfulDemoItemMutationPayload';
  deletedIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  clientMutationId?: Maybe<Scalars['String']>;
}

export interface DocumentDemoItemConnection {
  __typename?: 'DocumentDemoItemConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<DocumentDemoItemEdge>>;
}

/** A Relay edge containing a `DocumentDemoItem` and its cursor. */
export interface DocumentDemoItemEdge {
  __typename?: 'DocumentDemoItemEdge';
  /** The item at the end of the edge */
  node?: Maybe<DocumentDemoItemType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}

export interface DocumentDemoItemType extends Node {
  __typename?: 'DocumentDemoItemType';
  /** The ID of the object. */
  id: Scalars['ID'];
  file?: Maybe<FileFieldType>;
  createdAt: Scalars['DateTime'];
}

export interface FileFieldType {
  __typename?: 'FileFieldType';
  url?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
}

export interface MarkReadAllNotificationsMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface MarkReadAllNotificationsMutationPayload {
  __typename?: 'MarkReadAllNotificationsMutationPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
}

/** An object with an ID */
export interface Node {
  /** The ID of the object. */
  id: Scalars['ID'];
}

export interface NotificationConnection {
  __typename?: 'NotificationConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<NotificationEdge>>;
}

/** A Relay edge containing a `Notification` and its cursor. */
export interface NotificationEdge {
  __typename?: 'NotificationEdge';
  /** The item at the end of the edge */
  node?: Maybe<NotificationType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}

export interface NotificationType extends Node {
  __typename?: 'NotificationType';
  /** The ID of the object. */
  id: Scalars['ID'];
  type: Scalars['String'];
  createdAt: Scalars['DateTime'];
  readAt?: Maybe<Scalars['DateTime']>;
  data?: Maybe<Scalars['GenericScalar']>;
}

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export interface PageInfo {
  __typename?: 'PageInfo';
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
}

export interface Query {
  __typename?: 'Query';
  hasUnreadNotifications?: Maybe<Scalars['Boolean']>;
  allNotifications?: Maybe<NotificationConnection>;
  crudDemoItem?: Maybe<CrudDemoItemType>;
  allCrudDemoItems?: Maybe<CrudDemoItemConnection>;
  allContentfulDemoItemFavorites?: Maybe<ContentfulDemoItemFavoriteConnection>;
  allDocumentDemoItems?: Maybe<DocumentDemoItemConnection>;
  node?: Maybe<Node>;
}


export interface QueryAllNotificationsArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}


export interface QueryCrudDemoItemArgs {
  id: Scalars['ID'];
}


export interface QueryAllCrudDemoItemsArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}


export interface QueryAllContentfulDemoItemFavoritesArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}


export interface QueryAllDocumentDemoItemsArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}


export interface QueryNodeArgs {
  id: Scalars['ID'];
}

export interface UpdateCrudDemoItemMutationInput {
  name: Scalars['String'];
  createdBy?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface UpdateCrudDemoItemMutationPayload {
  __typename?: 'UpdateCrudDemoItemMutationPayload';
  crudDemoItem?: Maybe<CrudDemoItemType>;
  crudDemoItemEdge?: Maybe<CrudDemoItemEdge>;
  clientMutationId?: Maybe<Scalars['String']>;
}

export interface UpdateNotificationMutationInput {
  isRead?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface UpdateNotificationMutationPayload {
  __typename?: 'UpdateNotificationMutationPayload';
  notification?: Maybe<NotificationType>;
  notificationEdge?: Maybe<NotificationEdge>;
  hasUnreadNotifications?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
}
