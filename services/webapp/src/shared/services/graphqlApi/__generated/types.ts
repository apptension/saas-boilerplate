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
  /** The `Decimal` scalar type represents a python Decimal. */
  Decimal: any;
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
  changeActiveSubscription?: Maybe<ChangeActiveSubscriptionMutationPayload>;
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


export interface ApiMutationChangeActiveSubscriptionArgs {
  input: ChangeActiveSubscriptionMutationInput;
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

export interface ChangeActiveSubscriptionMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  price: Scalars['String'];
}

export interface ChangeActiveSubscriptionMutationPayload {
  __typename?: 'ChangeActiveSubscriptionMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  subscriptionSchedule?: Maybe<SubscriptionScheduleType>;
  subscriptionScheduleEdge?: Maybe<SubscriptionScheduleEdge>;
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

/** An enumeration. */
export enum PaymentMethodType {
  /** Acss Dbit */
  AcssDebit = 'ACSS_DEBIT',
  /** Afterpay Clearpay */
  AfterpayClearpay = 'AFTERPAY_CLEARPAY',
  /** Alipay */
  Alipay = 'ALIPAY',
  /** BECS Debit (Australia) */
  AuBecsDebit = 'AU_BECS_DEBIT',
  /** Bacs Direct Debit */
  BacsDebit = 'BACS_DEBIT',
  /** Bancontact */
  Bancontact = 'BANCONTACT',
  /** Boleto */
  Boleto = 'BOLETO',
  /** Card */
  Card = 'CARD',
  /** Card present */
  CardPresent = 'CARD_PRESENT',
  /** EPS */
  Eps = 'EPS',
  /** FPX */
  Fpx = 'FPX',
  /** Giropay */
  Giropay = 'GIROPAY',
  /** Grabpay */
  Grabpay = 'GRABPAY',
  /** iDEAL */
  Ideal = 'IDEAL',
  /** Interac (card present) */
  InteracPresent = 'INTERAC_PRESENT',
  /** Klarna */
  Klarna = 'KLARNA',
  /** OXXO */
  Oxxo = 'OXXO',
  /** Przelewy24 */
  P24 = 'P24',
  /** SEPA Direct Debit */
  SepaDebit = 'SEPA_DEBIT',
  /** SOFORT */
  Sofort = 'SOFORT',
  /** Wechat Pay */
  WechatPay = 'WECHAT_PAY'
}

/** An enumeration. */
export enum PriceBillingScheme {
  /** Per-unit */
  PerUnit = 'PER_UNIT',
  /** Tiered */
  Tiered = 'TIERED'
}

/** An enumeration. */
export enum PriceTiersMode {
  /** Graduated */
  Graduated = 'GRADUATED',
  /** Volume-based */
  Volume = 'VOLUME'
}

/** An enumeration. */
export enum PriceType {
  /** One-time */
  OneTime = 'ONE_TIME',
  /** Recurring */
  Recurring = 'RECURRING'
}

/** An enumeration. */
export enum ProductType {
  /** Good */
  Good = 'GOOD',
  /** Service */
  Service = 'SERVICE'
}

export interface Query {
  __typename?: 'Query';
  activeSubscription?: Maybe<SubscriptionScheduleType>;
  allContentfulDemoItemFavorites?: Maybe<ContentfulDemoItemFavoriteConnection>;
  allCrudDemoItems?: Maybe<CrudDemoItemConnection>;
  allDocumentDemoItems?: Maybe<DocumentDemoItemConnection>;
  allNotifications?: Maybe<NotificationConnection>;
  allSubscriptionPlans?: Maybe<SubscriptionPlanConnection>;
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


export interface QueryAllSubscriptionPlansArgs {
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

export interface StripePaymentMethodType extends Node {
  __typename?: 'StripePaymentMethodType';
  billingDetails?: Maybe<Scalars['GenericScalar']>;
  card?: Maybe<Scalars['GenericScalar']>;
  /** The ID of the object. */
  id: Scalars['ID'];
  pk?: Maybe<Scalars['String']>;
  /** The type of the PaymentMethod. */
  type: PaymentMethodType;
}

export interface StripeProductType extends Node {
  __typename?: 'StripeProductType';
  /** Whether the product is currently available for purchase. Only applicable to products of `type=good`. */
  active?: Maybe<Scalars['Boolean']>;
  /**
   * A list of up to 5 attributes that each SKU can provide values for (e.g.,
   * `["color", "size"]`). Only applicable to products of `type=good`.
   */
  attributes?: Maybe<Scalars['String']>;
  /**
   * A short one-line description of the product, meant to be displayableto the
   * customer. Only applicable to products of `type=good`.
   */
  caption: Scalars['String'];
  /** The datetime this object was created in stripe. */
  created?: Maybe<Scalars['DateTime']>;
  /** An array of connect application identifiers that cannot purchase this product. Only applicable to products of `type=good`. */
  deactivateOn?: Maybe<Scalars['String']>;
  /** A description of this object. */
  description?: Maybe<Scalars['String']>;
  djstripeCreated: Scalars['DateTime'];
  djstripeId: Scalars['ID'];
  djstripeUpdated: Scalars['DateTime'];
  /** The ID of the object. */
  id: Scalars['ID'];
  /**
   * A list of up to 8 URLs of images for this product, meant to be displayable to
   * the customer. Only applicable to products of `type=good`.
   */
  images?: Maybe<Scalars['String']>;
  /**
   * Null here indicates that the livemode status is unknown or was previously
   * unrecorded. Otherwise, this field indicates whether this record comes from
   * Stripe test mode or live mode operation.
   */
  livemode?: Maybe<Scalars['Boolean']>;
  /**
   * A set of key/value pairs that you can attach to an object. It can be useful
   * for storing additional information about an object in a structured format.
   */
  metadata?: Maybe<Scalars['String']>;
  /** The product's name, meant to be displayable to the customer. Applicable to both `service` and `good` types. */
  name: Scalars['String'];
  /**
   * The dimensions of this product for shipping purposes. A SKU associated with
   * this product can override this value by having its own `package_dimensions`.
   * Only applicable to products of `type=good`.
   */
  packageDimensions?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['String']>;
  /** The product this price is associated with. */
  prices: SubscriptionPlanTypeConnection;
  /** Whether this product is a shipped good. Only applicable to products of `type=good`. */
  shippable?: Maybe<Scalars['Boolean']>;
  /**
   * Extra information about a product which will appear on your customer's credit
   * card statement. In the case that multiple products are billed at once, the
   * first statement descriptor will be used. Only available on products of
   * type=`service`.
   */
  statementDescriptor: Scalars['String'];
  /**
   * The type of the product. The product is either of type `good`, which is
   * eligible for use with Orders and SKUs, or `service`, which is eligible for use
   * with Subscriptions and Plans.
   */
  type: ProductType;
  unitLabel: Scalars['String'];
  /** A URL of a publicly-accessible webpage for this product. Only applicable to products of `type=good`. */
  url?: Maybe<Scalars['String']>;
}


export interface StripeProductTypePricesArgs {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}

export interface StripeSubscriptionType extends Node {
  __typename?: 'StripeSubscriptionType';
  /**
   * End of the current period for which the subscription has been invoiced. At the
   * end of this period, a new invoice will be created.
   */
  currentPeriodEnd: Scalars['DateTime'];
  /** Start of the current period for which the subscription has been invoiced. */
  currentPeriodStart: Scalars['DateTime'];
  /** The ID of the object. */
  id: Scalars['ID'];
  pk?: Maybe<Scalars['String']>;
  /** Date when the subscription was first created. The date might differ from the created date due to backdating. */
  startDate?: Maybe<Scalars['DateTime']>;
  /** The status of this subscription. */
  status: SubscriptionStatus;
  /** If the subscription has a trial, the end of that trial. */
  trialEnd?: Maybe<Scalars['DateTime']>;
  /** If the subscription has a trial, the beginning of that trial. */
  trialStart?: Maybe<Scalars['DateTime']>;
}

export interface StripeSubscriptionTypeConnection {
  __typename?: 'StripeSubscriptionTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<StripeSubscriptionTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
}

/** A Relay edge containing a `StripeSubscriptionType` and its cursor. */
export interface StripeSubscriptionTypeEdge {
  __typename?: 'StripeSubscriptionTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<StripeSubscriptionType>;
}

export interface SubscriptionPlanConnection {
  __typename?: 'SubscriptionPlanConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SubscriptionPlanEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
}

/** A Relay edge containing a `SubscriptionPlan` and its cursor. */
export interface SubscriptionPlanEdge {
  __typename?: 'SubscriptionPlanEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<SubscriptionPlanType>;
}

export interface SubscriptionPlanType extends Node {
  __typename?: 'SubscriptionPlanType';
  /** Whether the price can be used for new purchases. */
  active: Scalars['Boolean'];
  /**
   * Describes how to compute the price per period. Either `per_unit` or `tiered`.
   * `per_unit` indicates that the fixed amount (specified in `unit_amount` or
   * `unit_amount_decimal`) will be charged per unit in `quantity` (for prices with
   * `usage_type=licensed`), or per unit of total usage (for prices with
   * `usage_type=metered`). `tiered` indicates that the unit pricing will be
   * computed using a tiering strategy as defined using the `tiers` and
   * `tiers_mode` attributes.
   */
  billingScheme?: Maybe<PriceBillingScheme>;
  /** The datetime this object was created in stripe. */
  created?: Maybe<Scalars['DateTime']>;
  /** Three-letter ISO currency code */
  currency: Scalars['String'];
  /** A description of this object. */
  description?: Maybe<Scalars['String']>;
  djstripeCreated: Scalars['DateTime'];
  djstripeId: Scalars['ID'];
  djstripeUpdated: Scalars['DateTime'];
  /** The ID of the object. */
  id: Scalars['ID'];
  /**
   * Null here indicates that the livemode status is unknown or was previously
   * unrecorded. Otherwise, this field indicates whether this record comes from
   * Stripe test mode or live mode operation.
   */
  livemode?: Maybe<Scalars['Boolean']>;
  /** A lookup key used to retrieve prices dynamically from a static string. */
  lookupKey?: Maybe<Scalars['String']>;
  /**
   * A set of key/value pairs that you can attach to an object. It can be useful
   * for storing additional information about an object in a structured format.
   */
  metadata?: Maybe<Scalars['String']>;
  /** A brief description of the plan, hidden from customers. */
  nickname: Scalars['String'];
  pk?: Maybe<Scalars['String']>;
  /** The product this price is associated with. */
  product: StripeProductType;
  /** The recurring components of a price such as `interval` and `usage_type`. */
  recurring?: Maybe<Scalars['String']>;
  /** Each element represents a pricing tier. This parameter requires `billing_scheme` to be set to `tiered`. */
  tiers?: Maybe<Scalars['String']>;
  /**
   * Defines if the tiering price should be `graduated` or `volume` based. In
   * `volume`-based tiering, the maximum quantity within a period determines the
   * per unit price, in `graduated` tiering pricing can successively change as the
   * quantity grows.
   */
  tiersMode?: Maybe<PriceTiersMode>;
  /**
   * Apply a transformation to the reported usage or set quantity before computing
   * the amount billed. Cannot be combined with `tiers`.
   */
  transformQuantity?: Maybe<Scalars['String']>;
  /** Whether the price is for a one-time purchase or a recurring (subscription) purchase. */
  type: PriceType;
  /**
   * The unit amount in cents to be charged, represented as a whole integer if
   * possible. Null if a sub-cent precision is required.
   */
  unitAmount?: Maybe<Scalars['Int']>;
  /** The unit amount in cents to be charged, represented as a decimal string with at most 12 decimal places. */
  unitAmountDecimal?: Maybe<Scalars['Decimal']>;
}

export interface SubscriptionPlanTypeConnection {
  __typename?: 'SubscriptionPlanTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SubscriptionPlanTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
}

/** A Relay edge containing a `SubscriptionPlanType` and its cursor. */
export interface SubscriptionPlanTypeEdge {
  __typename?: 'SubscriptionPlanTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<SubscriptionPlanType>;
}

/** A Relay edge containing a `SubscriptionSchedule` and its cursor. */
export interface SubscriptionScheduleEdge {
  __typename?: 'SubscriptionScheduleEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<SubscriptionScheduleType>;
}

/** An enumeration. */
export enum SubscriptionScheduleEndBehavior {
  /** Cancel */
  Cancel = 'CANCEL',
  /** Release */
  Release = 'RELEASE'
}

export interface SubscriptionSchedulePhaseItemType {
  __typename?: 'SubscriptionSchedulePhaseItemType';
  price?: Maybe<SubscriptionPlanType>;
  quantity?: Maybe<Scalars['Int']>;
}

export interface SubscriptionSchedulePhaseType {
  __typename?: 'SubscriptionSchedulePhaseType';
  endDate?: Maybe<Scalars['String']>;
  item?: Maybe<SubscriptionSchedulePhaseItemType>;
  startDate?: Maybe<Scalars['DateTime']>;
  trialEnd?: Maybe<Scalars['String']>;
}

/** An enumeration. */
export enum SubscriptionScheduleStatus {
  /** Active */
  Active = 'ACTIVE',
  /** Canceled */
  Canceled = 'CANCELED',
  /** Completed */
  Completed = 'COMPLETED',
  /** Not started */
  NotStarted = 'NOT_STARTED',
  /** Released */
  Released = 'RELEASED'
}

export interface SubscriptionScheduleType extends Node {
  __typename?: 'SubscriptionScheduleType';
  /** Define thresholds at which an invoice will be sent, and the related subscription advanced to a new billing period. */
  billingThresholds?: Maybe<Scalars['String']>;
  canActivateTrial?: Maybe<Scalars['Boolean']>;
  /** Time at which the subscription schedule was canceled. */
  canceledAt?: Maybe<Scalars['DateTime']>;
  /** Time at which the subscription schedule was completed. */
  completedAt?: Maybe<Scalars['DateTime']>;
  /** The datetime this object was created in stripe. */
  created?: Maybe<Scalars['DateTime']>;
  /** Object representing the start and end dates for the current phase of the subscription schedule, if it is `active`. */
  currentPhase?: Maybe<Scalars['String']>;
  defaultPaymentMethod?: Maybe<StripePaymentMethodType>;
  /** Object representing the subscription schedule's default settings. */
  defaultSettings?: Maybe<Scalars['String']>;
  /** A description of this object. */
  description?: Maybe<Scalars['String']>;
  djstripeCreated: Scalars['DateTime'];
  djstripeId: Scalars['ID'];
  djstripeUpdated: Scalars['DateTime'];
  /** Behavior of the subscription schedule and underlying subscription when it ends. */
  endBehavior: SubscriptionScheduleEndBehavior;
  /** The ID of the object. */
  id: Scalars['ID'];
  /**
   * Null here indicates that the livemode status is unknown or was previously
   * unrecorded. Otherwise, this field indicates whether this record comes from
   * Stripe test mode or live mode operation.
   */
  livemode?: Maybe<Scalars['Boolean']>;
  /**
   * A set of key/value pairs that you can attach to an object. It can be useful
   * for storing additional information about an object in a structured format.
   */
  metadata?: Maybe<Scalars['String']>;
  phases?: Maybe<Array<Maybe<SubscriptionSchedulePhaseType>>>;
  /** Time at which the subscription schedule was released. */
  releasedAt?: Maybe<Scalars['DateTime']>;
  /** The subscription once managed by this subscription schedule (if it is released). */
  releasedSubscription?: Maybe<StripeSubscriptionType>;
  /**
   * The present status of the subscription schedule. Possible values are
   * `not_started`, `active`, `completed`, `released`, and `canceled`.
   */
  status: SubscriptionScheduleStatus;
  subscription?: Maybe<StripeSubscriptionType>;
  /** The schedule associated with this subscription. */
  subscriptions: StripeSubscriptionTypeConnection;
}


export interface SubscriptionScheduleTypeSubscriptionsArgs {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}

/** An enumeration. */
export enum SubscriptionStatus {
  /** Active */
  Active = 'ACTIVE',
  /** Canceled */
  Canceled = 'CANCELED',
  /** Incomplete */
  Incomplete = 'INCOMPLETE',
  /** Incomplete Expired */
  IncompleteExpired = 'INCOMPLETE_EXPIRED',
  /** Past due */
  PastDue = 'PAST_DUE',
  /** Trialing */
  Trialing = 'TRIALING',
  /** Unpaid */
  Unpaid = 'UNPAID'
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
