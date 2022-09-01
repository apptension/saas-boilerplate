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
  createCrudDemoItem?: Maybe<CreateCrudDemoItemMutationPayload>;
  createDocumentDemoItem?: Maybe<CreateDocumentDemoItemMutationPayload>;
  createFavoriteContentfulDemoItem?: Maybe<CreateFavoriteContentfulDemoItemMutationPayload>;
  deleteCrudDemoItem?: Maybe<DeleteCrudDemoItemMutationPayload>;
  deleteDocumentDemoItem?: Maybe<DeleteDocumentDemoItemMutationPayload>;
  deleteFavoriteContentfulDemoItem?: Maybe<DeleteFavoriteContentfulDemoItemMutationPayload>;
  markReadAllNotifications?: Maybe<MarkReadAllNotificationsMutationPayload>;
  signUp?: Maybe<SingUpMutationPayload>;
  tokenAuth?: Maybe<ObtainTokenMutationPayload>;
  updateCrudDemoItem?: Maybe<UpdateCrudDemoItemMutationPayload>;
  updateCurrentUser?: Maybe<UpdateCurrentUserMutationPayload>;
  updateNotification?: Maybe<UpdateNotificationMutationPayload>;
}


export interface ApiMutationCreateCrudDemoItemArgs {
  input: CreateCrudDemoItemMutationInput;
}


export interface ApiMutationCreateDocumentDemoItemArgs {
  input: CreateDocumentDemoItemMutationInput;
}


export interface ApiMutationCreateFavoriteContentfulDemoItemArgs {
  input: CreateFavoriteContentfulDemoItemMutationInput;
}


export interface ApiMutationDeleteCrudDemoItemArgs {
  input: DeleteCrudDemoItemMutationInput;
}


export interface ApiMutationDeleteDocumentDemoItemArgs {
  input: DeleteDocumentDemoItemMutationInput;
}


export interface ApiMutationDeleteFavoriteContentfulDemoItemArgs {
  input: DeleteFavoriteContentfulDemoItemMutationInput;
}


export interface ApiMutationMarkReadAllNotificationsArgs {
  input: MarkReadAllNotificationsMutationInput;
}


export interface ApiMutationSignUpArgs {
  input: SingUpMutationInput;
}


export interface ApiMutationTokenAuthArgs {
  input: ObtainTokenMutationInput;
}


export interface ApiMutationUpdateCrudDemoItemArgs {
  input: UpdateCrudDemoItemMutationInput;
}


export interface ApiMutationUpdateCurrentUserArgs {
  input: UpdateCurrentUserMutationInput;
}


export interface ApiMutationUpdateNotificationArgs {
  input: UpdateNotificationMutationInput;
}

export interface ApiSubscription {
  __typename?: 'ApiSubscription';
  notificationCreated?: Maybe<NotificationConnection>;
}


export interface ApiSubscriptionNotificationCreatedArgs {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}

export interface ContentfulDemoItemFavoriteConnection {
  __typename?: 'ContentfulDemoItemFavoriteConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ContentfulDemoItemFavoriteEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
}

/** A Relay edge containing a `ContentfulDemoItemFavorite` and its cursor. */
export interface ContentfulDemoItemFavoriteEdge {
  __typename?: 'ContentfulDemoItemFavoriteEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ContentfulDemoItemFavoriteType>;
}

export interface ContentfulDemoItemFavoriteType extends Node {
  __typename?: 'ContentfulDemoItemFavoriteType';
  createdAt: Scalars['DateTime'];
  /** The ID of the object. */
  id: Scalars['ID'];
  item: ContentfulDemoItemType;
  updatedAt: Scalars['DateTime'];
  user: CurrentUserType;
}

export interface ContentfulDemoItemFavoriteTypeConnection {
  __typename?: 'ContentfulDemoItemFavoriteTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ContentfulDemoItemFavoriteTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
}

/** A Relay edge containing a `ContentfulDemoItemFavoriteType` and its cursor. */
export interface ContentfulDemoItemFavoriteTypeEdge {
  __typename?: 'ContentfulDemoItemFavoriteTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ContentfulDemoItemFavoriteType>;
}

export interface ContentfulDemoItemType extends Node {
  __typename?: 'ContentfulDemoItemType';
  contentfuldemoitemfavoriteSet: ContentfulDemoItemFavoriteTypeConnection;
  fields: Scalars['JSONString'];
  /** The ID of the object. */
  id: Scalars['ID'];
  isPublished: Scalars['Boolean'];
  pk?: Maybe<Scalars['String']>;
}


export interface ContentfulDemoItemTypeContentfuldemoitemfavoriteSetArgs {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}

export interface CreateCrudDemoItemMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  createdBy?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
}

export interface CreateCrudDemoItemMutationPayload {
  __typename?: 'CreateCrudDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  crudDemoItem?: Maybe<CrudDemoItemType>;
  crudDemoItemEdge?: Maybe<CrudDemoItemEdge>;
}

export interface CreateDocumentDemoItemMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  createdBy?: InputMaybe<Scalars['String']>;
  file?: InputMaybe<Scalars['Upload']>;
}

export interface CreateDocumentDemoItemMutationPayload {
  __typename?: 'CreateDocumentDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  documentDemoItem?: Maybe<DocumentDemoItemType>;
  documentDemoItemEdge?: Maybe<DocumentDemoItemEdge>;
}

export interface CreateFavoriteContentfulDemoItemMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  item: Scalars['String'];
  user?: InputMaybe<Scalars['String']>;
}

export interface CreateFavoriteContentfulDemoItemMutationPayload {
  __typename?: 'CreateFavoriteContentfulDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  contentfulDemoItemFavorite?: Maybe<ContentfulDemoItemFavoriteType>;
  contentfulDemoItemFavoriteEdge?: Maybe<ContentfulDemoItemFavoriteEdge>;
}

export interface CrudDemoItemConnection {
  __typename?: 'CrudDemoItemConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<CrudDemoItemEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
}

/** A Relay edge containing a `CrudDemoItem` and its cursor. */
export interface CrudDemoItemEdge {
  __typename?: 'CrudDemoItemEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<CrudDemoItemType>;
}

export interface CrudDemoItemType extends Node {
  __typename?: 'CrudDemoItemType';
  createdBy?: Maybe<CurrentUserType>;
  /** The ID of the object. */
  id: Scalars['ID'];
  name: Scalars['String'];
}

/** A Relay edge containing a `CurrentUser` and its cursor. */
export interface CurrentUserEdge {
  __typename?: 'CurrentUserEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<UserProfileType>;
}

export interface CurrentUserType {
  __typename?: 'CurrentUserType';
  avatar?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  lastName?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<Maybe<Scalars['String']>>>;
}

export interface DeleteCrudDemoItemMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
}

export interface DeleteCrudDemoItemMutationPayload {
  __typename?: 'DeleteCrudDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  deletedIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
}

export interface DeleteDocumentDemoItemMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
}

export interface DeleteDocumentDemoItemMutationPayload {
  __typename?: 'DeleteDocumentDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  deletedIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
}

export interface DeleteFavoriteContentfulDemoItemMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  item?: InputMaybe<Scalars['String']>;
}

export interface DeleteFavoriteContentfulDemoItemMutationPayload {
  __typename?: 'DeleteFavoriteContentfulDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  deletedIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
}

export interface DocumentDemoItemConnection {
  __typename?: 'DocumentDemoItemConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<DocumentDemoItemEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
}

/** A Relay edge containing a `DocumentDemoItem` and its cursor. */
export interface DocumentDemoItemEdge {
  __typename?: 'DocumentDemoItemEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<DocumentDemoItemType>;
}

export interface DocumentDemoItemType extends Node {
  __typename?: 'DocumentDemoItemType';
  createdAt: Scalars['DateTime'];
  createdBy?: Maybe<CurrentUserType>;
  file?: Maybe<FileFieldType>;
  /** The ID of the object. */
  id: Scalars['ID'];
}

export interface FileFieldType {
  __typename?: 'FileFieldType';
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
}

export interface MarkReadAllNotificationsMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface MarkReadAllNotificationsMutationPayload {
  __typename?: 'MarkReadAllNotificationsMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
}

/** An object with an ID */
export interface Node {
  /** The ID of the object. */
  id: Scalars['ID'];
}

export interface NotificationConnection {
  __typename?: 'NotificationConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<NotificationEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
}

/** A Relay edge containing a `Notification` and its cursor. */
export interface NotificationEdge {
  __typename?: 'NotificationEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<NotificationType>;
}

export interface NotificationType extends Node {
  __typename?: 'NotificationType';
  createdAt: Scalars['DateTime'];
  data?: Maybe<Scalars['GenericScalar']>;
  /** The ID of the object. */
  id: Scalars['ID'];
  readAt?: Maybe<Scalars['DateTime']>;
  type: Scalars['String'];
  user: CurrentUserType;
}

export interface ObtainTokenMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  password: Scalars['String'];
}

export interface ObtainTokenMutationPayload {
  __typename?: 'ObtainTokenMutationPayload';
  access?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  refresh?: Maybe<Scalars['String']>;
}

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export interface PageInfo {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
}

export interface Query {
  __typename?: 'Query';
  allContentfulDemoItemFavorites?: Maybe<ContentfulDemoItemFavoriteConnection>;
  allCrudDemoItems?: Maybe<CrudDemoItemConnection>;
  allDocumentDemoItems?: Maybe<DocumentDemoItemConnection>;
  allNotifications?: Maybe<NotificationConnection>;
  crudDemoItem?: Maybe<CrudDemoItemType>;
  currentUser?: Maybe<CurrentUserType>;
  hasUnreadNotifications?: Maybe<Scalars['Boolean']>;
  node?: Maybe<Node>;
}


export interface QueryAllContentfulDemoItemFavoritesArgs {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}


export interface QueryAllCrudDemoItemsArgs {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}


export interface QueryAllDocumentDemoItemsArgs {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}


export interface QueryAllNotificationsArgs {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}


export interface QueryCrudDemoItemArgs {
  id: Scalars['ID'];
}


export interface QueryNodeArgs {
  id: Scalars['ID'];
}

export interface SingUpMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
}

export interface SingUpMutationPayload {
  __typename?: 'SingUpMutationPayload';
  access?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  refresh?: Maybe<Scalars['String']>;
}

export interface UpdateCrudDemoItemMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  createdBy?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
}

export interface UpdateCrudDemoItemMutationPayload {
  __typename?: 'UpdateCrudDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  crudDemoItem?: Maybe<CrudDemoItemType>;
  crudDemoItemEdge?: Maybe<CrudDemoItemEdge>;
}

export interface UpdateCurrentUserMutationInput {
  avatar?: InputMaybe<Scalars['Upload']>;
  clientMutationId?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
}

export interface UpdateCurrentUserMutationPayload {
  __typename?: 'UpdateCurrentUserMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  userProfile?: Maybe<UserProfileType>;
  userProfileEdge?: Maybe<CurrentUserEdge>;
}

export interface UpdateNotificationMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  isRead?: InputMaybe<Scalars['Boolean']>;
}

export interface UpdateNotificationMutationPayload {
  __typename?: 'UpdateNotificationMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  hasUnreadNotifications?: Maybe<Scalars['Boolean']>;
  notification?: Maybe<NotificationType>;
  notificationEdge?: Maybe<NotificationEdge>;
}

export interface UserProfileType extends Node {
  __typename?: 'UserProfileType';
  firstName: Scalars['String'];
  /** The ID of the object. */
  id: Scalars['ID'];
  lastName: Scalars['String'];
  user: CurrentUserType;
}
