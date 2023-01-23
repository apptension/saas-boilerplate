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
  cancelActiveSubscription?: Maybe<CancelActiveSubscriptionMutationPayload>;
  changeActiveSubscription?: Maybe<ChangeActiveSubscriptionMutationPayload>;
  changePassword?: Maybe<ChangePasswordMutationPayload>;
  confirm?: Maybe<ConfirmEmailMutationPayload>;
  createCrudDemoItem?: Maybe<CreateCrudDemoItemMutationPayload>;
  createDocumentDemoItem?: Maybe<CreateDocumentDemoItemMutationPayload>;
  createFavoriteContentfulDemoItem?: Maybe<CreateFavoriteContentfulDemoItemMutationPayload>;
  createPaymentIntent?: Maybe<CreatePaymentIntentMutationPayload>;
  createSetupIntent?: Maybe<CreateSetupIntentMutationPayload>;
  deleteCrudDemoItem?: Maybe<DeleteCrudDemoItemMutationPayload>;
  deleteDocumentDemoItem?: Maybe<DeleteDocumentDemoItemMutationPayload>;
  deleteFavoriteContentfulDemoItem?: Maybe<DeleteFavoriteContentfulDemoItemMutationPayload>;
  deletePaymentMethod?: Maybe<DeletePaymentMethodMutationPayload>;
  markReadAllNotifications?: Maybe<MarkReadAllNotificationsMutationPayload>;
  passwordReset?: Maybe<PasswordResetMutationPayload>;
  passwordResetConfirm?: Maybe<PasswordResetConfirmationMutationPayload>;
  signUp?: Maybe<SingUpMutationPayload>;
  tokenAuth?: Maybe<ObtainTokenMutationPayload>;
  updateCrudDemoItem?: Maybe<UpdateCrudDemoItemMutationPayload>;
  updateCurrentUser?: Maybe<UpdateCurrentUserMutationPayload>;
  updateDefaultPaymentMethod?: Maybe<UpdateDefaultPaymentMethodMutationPayload>;
  updateNotification?: Maybe<UpdateNotificationMutationPayload>;
  updatePaymentIntent?: Maybe<UpdatePaymentIntentMutationPayload>;
}


export interface ApiMutationCancelActiveSubscriptionArgs {
  input: CancelActiveSubscriptionMutationInput;
}


export interface ApiMutationChangeActiveSubscriptionArgs {
  input: ChangeActiveSubscriptionMutationInput;
}


export interface ApiMutationChangePasswordArgs {
  input: ChangePasswordMutationInput;
}


export interface ApiMutationConfirmArgs {
  input: ConfirmEmailMutationInput;
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


export interface ApiMutationCreatePaymentIntentArgs {
  input: CreatePaymentIntentMutationInput;
}


export interface ApiMutationCreateSetupIntentArgs {
  input: CreateSetupIntentMutationInput;
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


export interface ApiMutationDeletePaymentMethodArgs {
  input: DeletePaymentMethodMutationInput;
}


export interface ApiMutationMarkReadAllNotificationsArgs {
  input: MarkReadAllNotificationsMutationInput;
}


export interface ApiMutationPasswordResetArgs {
  input: PasswordResetMutationInput;
}


export interface ApiMutationPasswordResetConfirmArgs {
  input: PasswordResetConfirmationMutationInput;
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


export interface ApiMutationUpdateDefaultPaymentMethodArgs {
  input: UpdateDefaultPaymentMethodMutationInput;
}


export interface ApiMutationUpdateNotificationArgs {
  input: UpdateNotificationMutationInput;
}


export interface ApiMutationUpdatePaymentIntentArgs {
  input: UpdatePaymentIntentMutationInput;
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

export interface CancelActiveSubscriptionMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface CancelActiveSubscriptionMutationPayload {
  __typename?: 'CancelActiveSubscriptionMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  subscriptionSchedule?: Maybe<SubscriptionScheduleType>;
  subscriptionScheduleEdge?: Maybe<SubscriptionScheduleEdge>;
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

export interface ChangePasswordMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** New password */
  newPassword: Scalars['String'];
  /** Old password */
  oldPassword: Scalars['String'];
}

export interface ChangePasswordMutationPayload {
  __typename?: 'ChangePasswordMutationPayload';
  access?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  refresh?: Maybe<Scalars['String']>;
}

export interface ChargeConnection {
  __typename?: 'ChargeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ChargeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
}

/** A Relay edge containing a `Charge` and its cursor. */
export interface ChargeEdge {
  __typename?: 'ChargeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<StripeChargeType>;
}

/** An enumeration. */
export enum ChargeFailureCode {
  /** Account already exists */
  AccountAlreadyExists = 'ACCOUNT_ALREADY_EXISTS',
  /** Account country invalid address */
  AccountCountryInvalidAddress = 'ACCOUNT_COUNTRY_INVALID_ADDRESS',
  /** Account invalid */
  AccountInvalid = 'ACCOUNT_INVALID',
  /** Account number invalid */
  AccountNumberInvalid = 'ACCOUNT_NUMBER_INVALID',
  /** Alipay upgrade required */
  AlipayUpgradeRequired = 'ALIPAY_UPGRADE_REQUIRED',
  /** Amount too large */
  AmountTooLarge = 'AMOUNT_TOO_LARGE',
  /** Amount too small */
  AmountTooSmall = 'AMOUNT_TOO_SMALL',
  /** Api key expired */
  ApiKeyExpired = 'API_KEY_EXPIRED',
  /** Balance insufficient */
  BalanceInsufficient = 'BALANCE_INSUFFICIENT',
  /** Bank account exists */
  BankAccountExists = 'BANK_ACCOUNT_EXISTS',
  /** Bank account unusable */
  BankAccountUnusable = 'BANK_ACCOUNT_UNUSABLE',
  /** Bank account unverified */
  BankAccountUnverified = 'BANK_ACCOUNT_UNVERIFIED',
  /** Bitcoin upgrade required */
  BitcoinUpgradeRequired = 'BITCOIN_UPGRADE_REQUIRED',
  /** Card was declined */
  CardDeclined = 'CARD_DECLINED',
  /** Charge already captured */
  ChargeAlreadyCaptured = 'CHARGE_ALREADY_CAPTURED',
  /** Charge already refunded */
  ChargeAlreadyRefunded = 'CHARGE_ALREADY_REFUNDED',
  /** Charge disputed */
  ChargeDisputed = 'CHARGE_DISPUTED',
  /** Charge exceeds source limit */
  ChargeExceedsSourceLimit = 'CHARGE_EXCEEDS_SOURCE_LIMIT',
  /** Charge expired for capture */
  ChargeExpiredForCapture = 'CHARGE_EXPIRED_FOR_CAPTURE',
  /** Country unsupported */
  CountryUnsupported = 'COUNTRY_UNSUPPORTED',
  /** Coupon expired */
  CouponExpired = 'COUPON_EXPIRED',
  /** Customer max subscriptions */
  CustomerMaxSubscriptions = 'CUSTOMER_MAX_SUBSCRIPTIONS',
  /** Email invalid */
  EmailInvalid = 'EMAIL_INVALID',
  /** Expired card */
  ExpiredCard = 'EXPIRED_CARD',
  /** Idempotency key in use */
  IdempotencyKeyInUse = 'IDEMPOTENCY_KEY_IN_USE',
  /** Incorrect address */
  IncorrectAddress = 'INCORRECT_ADDRESS',
  /** Incorrect security code */
  IncorrectCvc = 'INCORRECT_CVC',
  /** Incorrect number */
  IncorrectNumber = 'INCORRECT_NUMBER',
  /** ZIP code failed validation */
  IncorrectZip = 'INCORRECT_ZIP',
  /** Instant payouts unsupported */
  InstantPayoutsUnsupported = 'INSTANT_PAYOUTS_UNSUPPORTED',
  /** Invalid card type */
  InvalidCardType = 'INVALID_CARD_TYPE',
  /** Invalid charge amount */
  InvalidChargeAmount = 'INVALID_CHARGE_AMOUNT',
  /** Invalid security code */
  InvalidCvc = 'INVALID_CVC',
  /** Invalid expiration month */
  InvalidExpiryMonth = 'INVALID_EXPIRY_MONTH',
  /** Invalid expiration year */
  InvalidExpiryYear = 'INVALID_EXPIRY_YEAR',
  /** Invalid number */
  InvalidNumber = 'INVALID_NUMBER',
  /** Invalid source usage */
  InvalidSourceUsage = 'INVALID_SOURCE_USAGE',
  /** Invalid swipe data */
  InvalidSwipeData = 'INVALID_SWIPE_DATA',
  /** Invoice not editable */
  InvoiceNotEditable = 'INVOICE_NOT_EDITABLE',
  /** Invoice no customer line items */
  InvoiceNoCustomerLineItems = 'INVOICE_NO_CUSTOMER_LINE_ITEMS',
  /** Invoice no subscription line items */
  InvoiceNoSubscriptionLineItems = 'INVOICE_NO_SUBSCRIPTION_LINE_ITEMS',
  /** Invoice upcoming none */
  InvoiceUpcomingNone = 'INVOICE_UPCOMING_NONE',
  /** Livemode mismatch */
  LivemodeMismatch = 'LIVEMODE_MISMATCH',
  /** No card being charged */
  Missing = 'MISSING',
  /** Not allowed on standard account */
  NotAllowedOnStandardAccount = 'NOT_ALLOWED_ON_STANDARD_ACCOUNT',
  /** Order creation failed */
  OrderCreationFailed = 'ORDER_CREATION_FAILED',
  /** Order required settings */
  OrderRequiredSettings = 'ORDER_REQUIRED_SETTINGS',
  /** Order status invalid */
  OrderStatusInvalid = 'ORDER_STATUS_INVALID',
  /** Order upstream timeout */
  OrderUpstreamTimeout = 'ORDER_UPSTREAM_TIMEOUT',
  /** Out of inventory */
  OutOfInventory = 'OUT_OF_INVENTORY',
  /** Parameters exclusive */
  ParametersExclusive = 'PARAMETERS_EXCLUSIVE',
  /** Parameter invalid empty */
  ParameterInvalidEmpty = 'PARAMETER_INVALID_EMPTY',
  /** Parameter invalid integer */
  ParameterInvalidInteger = 'PARAMETER_INVALID_INTEGER',
  /** Parameter invalid string blank */
  ParameterInvalidStringBlank = 'PARAMETER_INVALID_STRING_BLANK',
  /** Parameter invalid string empty */
  ParameterInvalidStringEmpty = 'PARAMETER_INVALID_STRING_EMPTY',
  /** Parameter missing */
  ParameterMissing = 'PARAMETER_MISSING',
  /** Parameter unknown */
  ParameterUnknown = 'PARAMETER_UNKNOWN',
  /** Payment intent authentication failure */
  PaymentIntentAuthenticationFailure = 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
  /** Payment intent incompatible payment method */
  PaymentIntentIncompatiblePaymentMethod = 'PAYMENT_INTENT_INCOMPATIBLE_PAYMENT_METHOD',
  /** Payment intent invalid parameter */
  PaymentIntentInvalidParameter = 'PAYMENT_INTENT_INVALID_PARAMETER',
  /** Payment intent payment attempt failed */
  PaymentIntentPaymentAttemptFailed = 'PAYMENT_INTENT_PAYMENT_ATTEMPT_FAILED',
  /** Payment intent unexpected state */
  PaymentIntentUnexpectedState = 'PAYMENT_INTENT_UNEXPECTED_STATE',
  /** Payment method unactivated */
  PaymentMethodUnactivated = 'PAYMENT_METHOD_UNACTIVATED',
  /** Payment method unexpected state */
  PaymentMethodUnexpectedState = 'PAYMENT_METHOD_UNEXPECTED_STATE',
  /** Payouts not allowed */
  PayoutsNotAllowed = 'PAYOUTS_NOT_ALLOWED',
  /** Platform api key expired */
  PlatformApiKeyExpired = 'PLATFORM_API_KEY_EXPIRED',
  /** Postal code invalid */
  PostalCodeInvalid = 'POSTAL_CODE_INVALID',
  /** Processing error */
  ProcessingError = 'PROCESSING_ERROR',
  /** Product inactive */
  ProductInactive = 'PRODUCT_INACTIVE',
  /** Rate limit */
  RateLimit = 'RATE_LIMIT',
  /** Resource already exists */
  ResourceAlreadyExists = 'RESOURCE_ALREADY_EXISTS',
  /** Resource missing */
  ResourceMissing = 'RESOURCE_MISSING',
  /** Routing number invalid */
  RoutingNumberInvalid = 'ROUTING_NUMBER_INVALID',
  /** Secret key required */
  SecretKeyRequired = 'SECRET_KEY_REQUIRED',
  /** SEPA unsupported account */
  SepaUnsupportedAccount = 'SEPA_UNSUPPORTED_ACCOUNT',
  /** Shipping calculation failed */
  ShippingCalculationFailed = 'SHIPPING_CALCULATION_FAILED',
  /** SKU inactive */
  SkuInactive = 'SKU_INACTIVE',
  /** State unsupported */
  StateUnsupported = 'STATE_UNSUPPORTED',
  /** Taxes calculation failed */
  TaxesCalculationFailed = 'TAXES_CALCULATION_FAILED',
  /** Tax id invalid */
  TaxIdInvalid = 'TAX_ID_INVALID',
  /** Testmode charges only */
  TestmodeChargesOnly = 'TESTMODE_CHARGES_ONLY',
  /** TLS version unsupported */
  TlsVersionUnsupported = 'TLS_VERSION_UNSUPPORTED',
  /** Token already used */
  TokenAlreadyUsed = 'TOKEN_ALREADY_USED',
  /** Token in use */
  TokenInUse = 'TOKEN_IN_USE',
  /** Transfers not allowed */
  TransfersNotAllowed = 'TRANSFERS_NOT_ALLOWED',
  /** Upstream order creation failed */
  UpstreamOrderCreationFailed = 'UPSTREAM_ORDER_CREATION_FAILED',
  /** URL invalid */
  UrlInvalid = 'URL_INVALID'
}

/** An enumeration. */
export enum ChargeStatus {
  /** Failed */
  Failed = 'FAILED',
  /** Pending */
  Pending = 'PENDING',
  /** Succeeded */
  Succeeded = 'SUCCEEDED'
}

export interface ConfirmEmailMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  token: Scalars['String'];
  user: Scalars['String'];
}

export interface ConfirmEmailMutationPayload {
  __typename?: 'ConfirmEmailMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
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

export interface CreatePaymentIntentMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  product: Scalars['String'];
}

export interface CreatePaymentIntentMutationPayload {
  __typename?: 'CreatePaymentIntentMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  paymentIntent?: Maybe<StripePaymentIntentType>;
}

export interface CreateSetupIntentMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
}

export interface CreateSetupIntentMutationPayload {
  __typename?: 'CreateSetupIntentMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  setupIntent?: Maybe<StripeSetupIntentType>;
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

export interface DeletePaymentMethodMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
}

export interface DeletePaymentMethodMutationPayload {
  __typename?: 'DeletePaymentMethodMutationPayload';
  activeSubscription?: Maybe<SubscriptionScheduleType>;
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

/** An enumeration. */
export enum InvoiceBillingReason {
  /** Manual */
  Manual = 'MANUAL',
  /** Subscription */
  Subscription = 'SUBSCRIPTION',
  /** Subscription create */
  SubscriptionCreate = 'SUBSCRIPTION_CREATE',
  /** Subscription cycle */
  SubscriptionCycle = 'SUBSCRIPTION_CYCLE',
  /** Subscription threshold */
  SubscriptionThreshold = 'SUBSCRIPTION_THRESHOLD',
  /** Subscription update */
  SubscriptionUpdate = 'SUBSCRIPTION_UPDATE',
  /** Upcoming */
  Upcoming = 'UPCOMING'
}

/** An enumeration. */
export enum InvoiceCollectionMethod {
  /** Charge automatically */
  ChargeAutomatically = 'CHARGE_AUTOMATICALLY',
  /** Send invoice */
  SendInvoice = 'SEND_INVOICE'
}

/** An enumeration. */
export enum InvoiceCustomerTaxExempt {
  /** Exempt */
  Exempt = 'EXEMPT',
  /** None */
  None = 'NONE',
  /** Reverse */
  Reverse = 'REVERSE'
}

/** An enumeration. */
export enum InvoiceStatus {
  /** Draft */
  Draft = 'DRAFT',
  /** Open */
  Open = 'OPEN',
  /** Paid */
  Paid = 'PAID',
  /** Uncollectible */
  Uncollectible = 'UNCOLLECTIBLE',
  /** Void */
  Void = 'VOID'
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

export interface PasswordResetConfirmationMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** New password */
  newPassword: Scalars['String'];
  /** Token */
  token: Scalars['String'];
  user: Scalars['String'];
}

export interface PasswordResetConfirmationMutationPayload {
  __typename?: 'PasswordResetConfirmationMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
}

export interface PasswordResetMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** User e-mail */
  email: Scalars['String'];
}

export interface PasswordResetMutationPayload {
  __typename?: 'PasswordResetMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
}

export interface PaymentMethodConnection {
  __typename?: 'PaymentMethodConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<PaymentMethodEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
}

/** A Relay edge containing a `PaymentMethod` and its cursor. */
export interface PaymentMethodEdge {
  __typename?: 'PaymentMethodEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<StripePaymentMethodType>;
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
  allCharges?: Maybe<ChargeConnection>;
  allContentfulDemoItemFavorites?: Maybe<ContentfulDemoItemFavoriteConnection>;
  allCrudDemoItems?: Maybe<CrudDemoItemConnection>;
  allDocumentDemoItems?: Maybe<DocumentDemoItemConnection>;
  allNotifications?: Maybe<NotificationConnection>;
  allPaymentMethods?: Maybe<PaymentMethodConnection>;
  allSubscriptionPlans?: Maybe<SubscriptionPlanConnection>;
  charge?: Maybe<StripeChargeType>;
  crudDemoItem?: Maybe<CrudDemoItemType>;
  currentUser?: Maybe<CurrentUserType>;
  hasUnreadNotifications?: Maybe<Scalars['Boolean']>;
  node?: Maybe<Node>;
  paymentIntent?: Maybe<StripePaymentIntentType>;
}


export interface QueryAllChargesArgs {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
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


export interface QueryAllPaymentMethodsArgs {
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


export interface QueryChargeArgs {
  id?: InputMaybe<Scalars['ID']>;
}


export interface QueryCrudDemoItemArgs {
  id: Scalars['ID'];
}


export interface QueryNodeArgs {
  id: Scalars['ID'];
}


export interface QueryPaymentIntentArgs {
  id?: InputMaybe<Scalars['ID']>;
}

/** An enumeration. */
export enum SetupIntentCancellationReason {
  /** Abandoned */
  Abandoned = 'ABANDONED',
  /** Duplicate */
  Duplicate = 'DUPLICATE',
  /** Requested by Customer */
  RequestedByCustomer = 'REQUESTED_BY_CUSTOMER'
}

/** An enumeration. */
export enum SetupIntentStatus {
  /** Cancellation invalidates the intent for future confirmation and cannot be undone. */
  Canceled = 'CANCELED',
  /** Required actions have been handled. */
  Processing = 'PROCESSING',
  /** Payment Method require additional action, such as 3D secure. */
  RequiresAction = 'REQUIRES_ACTION',
  /** Intent is ready to be confirmed. */
  RequiresConfirmation = 'REQUIRES_CONFIRMATION',
  /** Intent created and requires a Payment Method to be attached. */
  RequiresPaymentMethod = 'REQUIRES_PAYMENT_METHOD',
  /** Setup was successful and the payment method is optimized for future payments. */
  Succeeded = 'SUCCEEDED'
}

/** An enumeration. */
export enum SetupIntentUsage {
  /** Off session */
  OffSession = 'OFF_SESSION',
  /** On session */
  OnSession = 'ON_SESSION'
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

export interface StripeChargeType extends Node {
  __typename?: 'StripeChargeType';
  /** Amount charged (as decimal). */
  amount: Scalars['Decimal'];
  /** Amount (as decimal) captured (can be less than the amount attribute on the charge if a partial capture was issued). */
  amountCaptured?: Maybe<Scalars['Decimal']>;
  /** Amount (as decimal) refunded (can be less than the amount attribute on the charge if a partial refund was issued). */
  amountRefunded: Scalars['Decimal'];
  /** ID of the Connect application that created the charge. */
  application: Scalars['String'];
  /** The amount (as decimal) of the application fee (if any) requested for the charge. */
  applicationFeeAmount?: Maybe<Scalars['Decimal']>;
  billingDetails?: Maybe<Scalars['GenericScalar']>;
  /**
   * The full statement descriptor that is passed to card networks, and that is
   * displayed on your customers' credit card and bank statements. Allows you to
   * see what the statement descriptor looks like after the static and dynamic
   * portions are combined.
   */
  calculatedStatementDescriptor: Scalars['String'];
  /**
   * If the charge was created without capturing, this boolean represents whether
   * or not it is still uncaptured or has since been captured.
   */
  captured: Scalars['Boolean'];
  /** The datetime this object was created in stripe. */
  created?: Maybe<Scalars['DateTime']>;
  /** The currency in which the charge was made. */
  currency: Scalars['String'];
  /** A description of this object. */
  description?: Maybe<Scalars['String']>;
  /** Whether the charge has been disputed. */
  disputed: Scalars['Boolean'];
  djstripeCreated: Scalars['DateTime'];
  djstripeId: Scalars['ID'];
  djstripeUpdated: Scalars['DateTime'];
  /** Error code explaining reason for charge failure if available. */
  failureCode?: Maybe<ChargeFailureCode>;
  /** Message to user further explaining reason for charge failure if available. */
  failureMessage: Scalars['String'];
  /** Hash with information on fraud assessments for the charge. */
  fraudDetails?: Maybe<Scalars['String']>;
  /** The ID of the object. */
  id: Scalars['ID'];
  /** The invoice this charge is for if one exists. */
  invoice?: Maybe<StripeInvoiceType>;
  latestInvoice?: Maybe<StripeInvoiceType>;
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
  /** Details about whether or not the payment was accepted, and why. */
  outcome?: Maybe<Scalars['String']>;
  /** True if the charge succeeded, or was successfully authorized for later capture, False otherwise. */
  paid: Scalars['Boolean'];
  /** PaymentIntent associated with this charge, if one exists. */
  paymentIntent?: Maybe<StripePaymentIntentType>;
  /** PaymentMethod used in this charge. */
  paymentMethod?: Maybe<StripePaymentMethodType>;
  /** Details about the payment method at the time of the transaction. */
  paymentMethodDetails?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['String']>;
  /** The email address that the receipt for this charge was sent to. */
  receiptEmail: Scalars['String'];
  /** The transaction number that appears on email receipts sent for this charge. */
  receiptNumber: Scalars['String'];
  /**
   * This is the URL to view the receipt for this charge. The receipt is kept
   * up-to-date to the latest state of the charge, including any refunds. If the
   * charge is for an Invoice, the receipt will be stylized as an Invoice receipt.
   */
  receiptUrl: Scalars['String'];
  /**
   * Whether or not the charge has been fully refunded. If the charge is only
   * partially refunded, this attribute will still be false.
   */
  refunded: Scalars['Boolean'];
  /** Shipping information for the charge */
  shipping?: Maybe<Scalars['String']>;
  /**
   * For card charges, use statement_descriptor_suffix instead. Otherwise, you can
   * use this value as the complete description of a charge on your customers'
   * statements. Must contain at least one letter, maximum 22 characters.
   */
  statementDescriptor?: Maybe<Scalars['String']>;
  /**
   * Provides information about the charge that customers see on their statements.
   * Concatenated with the prefix (shortened descriptor) or statement descriptor
   * that's set on the account to form the complete statement descriptor. Maximum
   * 22 characters for the concatenated descriptor.
   */
  statementDescriptorSuffix?: Maybe<Scalars['String']>;
  /** The status of the payment. */
  status: ChargeStatus;
  /** An optional dictionary including the account to automatically transfer to as part of a destination charge. */
  transferData?: Maybe<Scalars['String']>;
  /** A string that identifies this transaction as part of a group. */
  transferGroup?: Maybe<Scalars['String']>;
}

export interface StripeChargeTypeConnection {
  __typename?: 'StripeChargeTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<StripeChargeTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
}

/** A Relay edge containing a `StripeChargeType` and its cursor. */
export interface StripeChargeTypeEdge {
  __typename?: 'StripeChargeTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<StripeChargeType>;
}

export interface StripeInvoiceType extends Node {
  __typename?: 'StripeInvoiceType';
  /** The country of the business associated with this invoice, most often the business creating the invoice. */
  accountCountry: Scalars['String'];
  /** The public name of the business associated with this invoice, most often the business creating the invoice. */
  accountName: Scalars['String'];
  /**
   * Final amount due (as decimal) at this time for this invoice. If the invoice's
   * total is smaller than the minimum charge amount, for example, or if there is
   * account credit that can be applied to the invoice, the amount_due may be 0. If
   * there is a positive starting_balance for the invoice (the customer owes
   * money), the amount_due will also take that into account. The charge that gets
   * generated for the invoice will be for the amount specified in amount_due.
   */
  amountDue: Scalars['Decimal'];
  /** The amount, (as decimal), that was paid. */
  amountPaid?: Maybe<Scalars['Decimal']>;
  /** The amount remaining, (as decimal), that is due. */
  amountRemaining?: Maybe<Scalars['Decimal']>;
  /**
   * The fee (as decimal) that will be applied to the invoice and transferred to
   * the application owner's Stripe account when the invoice is paid.
   */
  applicationFeeAmount?: Maybe<Scalars['Decimal']>;
  /**
   * Number of payment attempts made for this invoice, from the perspective of the
   * payment retry schedule. Any payment attempt counts as the first attempt, and
   * subsequently only automatic retries increment the attempt count. In other
   * words, manual payment attempts after the first attempt do not affect the retry schedule.
   */
  attemptCount: Scalars['Int'];
  /**
   * Whether or not an attempt has been made to pay the invoice. An invoice is not
   * attempted until 1 hour after the ``invoice.created`` webhook, for example, so
   * you might not want to display that invoice as unpaid to your users.
   */
  attempted: Scalars['Boolean'];
  /**
   * Controls whether Stripe will perform automatic collection of the invoice. When
   * false, the invoice's state will not automatically advance without an explicit action.
   */
  autoAdvance?: Maybe<Scalars['Boolean']>;
  /**
   * Indicates the reason why the invoice was created. subscription_cycle indicates
   * an invoice created by a subscription advancing into a new period.
   * subscription_create indicates an invoice created due to creating a
   * subscription. subscription_update indicates an invoice created due to updating
   * a subscription. subscription is set for all old invoices to indicate either a
   * change to a subscription or a period advancement. manual is set for all
   * invoices unrelated to a subscription (for example: created via the invoice
   * editor). The upcoming value is reserved for simulated invoices per the
   * upcoming invoice endpoint. subscription_threshold indicates an invoice created
   * due to a billing threshold being reached.
   */
  billingReason?: Maybe<InvoiceBillingReason>;
  /** The latest charge generated for this invoice, if any. */
  charge?: Maybe<StripeChargeType>;
  /** The invoice this charge is for if one exists. */
  charges: StripeChargeTypeConnection;
  /**
   * When charging automatically, Stripe will attempt to pay this invoice using the
   * default source attached to the customer. When sending an invoice, Stripe will
   * email this invoice to the customer with payment instructions.
   */
  collectionMethod?: Maybe<InvoiceCollectionMethod>;
  /** The datetime this object was created in stripe. */
  created?: Maybe<Scalars['DateTime']>;
  /** Three-letter ISO currency code */
  currency: Scalars['String'];
  /**
   * The customer's address. Until the invoice is finalized, this field will equal
   * customer.address. Once the invoice is finalized, this field will no longer be updated.
   */
  customerAddress?: Maybe<Scalars['String']>;
  /**
   * The customer's email. Until the invoice is finalized, this field will equal
   * customer.email. Once the invoice is finalized, this field will no longer be updated.
   */
  customerEmail: Scalars['String'];
  /**
   * The customer's name. Until the invoice is finalized, this field will equal
   * customer.name. Once the invoice is finalized, this field will no longer be updated.
   */
  customerName: Scalars['String'];
  /**
   * The customer's phone number. Until the invoice is finalized, this field will
   * equal customer.phone. Once the invoice is finalized, this field will no longer be updated.
   */
  customerPhone: Scalars['String'];
  /**
   * The customer's shipping information. Until the invoice is finalized, this
   * field will equal customer.shipping. Once the invoice is finalized, this field
   * will no longer be updated.
   */
  customerShipping?: Maybe<Scalars['String']>;
  /**
   * The customer's tax exempt status. Until the invoice is finalized, this field
   * will equal customer.tax_exempt. Once the invoice is finalized, this field will
   * no longer be updated.
   */
  customerTaxExempt: InvoiceCustomerTaxExempt;
  /**
   * Default payment method for the invoice. It must belong to the customer
   * associated with the invoice. If not set, defaults to the subscription's
   * default payment method, if any, or to the default payment method in the
   * customer's invoice settings.
   */
  defaultPaymentMethod?: Maybe<StripePaymentMethodType>;
  /** A description of this object. */
  description?: Maybe<Scalars['String']>;
  /**
   * Describes the current discount applied to this subscription, if there is one.
   * When billing, a discount applied to a subscription overrides a discount
   * applied on a customer-wide basis.
   */
  discount?: Maybe<Scalars['String']>;
  djstripeCreated: Scalars['DateTime'];
  djstripeId: Scalars['ID'];
  djstripeUpdated: Scalars['DateTime'];
  /**
   * The date on which payment for this invoice is due. This value will be null for
   * invoices where billing=charge_automatically.
   */
  dueDate?: Maybe<Scalars['DateTime']>;
  /**
   * Ending customer balance (in cents) after attempting to pay invoice. If the
   * invoice has not been attempted yet, this will be null.
   */
  endingBalance?: Maybe<Scalars['Int']>;
  /** Footer displayed on the invoice. */
  footer: Scalars['String'];
  /**
   * The URL for the hosted invoice page, which allows customers to view and pay an
   * invoice. If the invoice has not been frozen yet, this will be null.
   */
  hostedInvoiceUrl: Scalars['String'];
  /** The ID of the object. */
  id: Scalars['ID'];
  /** The link to download the PDF for the invoice. If the invoice has not been frozen yet, this will be null. */
  invoicePdf: Scalars['String'];
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
  /** The time at which payment will next be attempted. */
  nextPaymentAttempt?: Maybe<Scalars['DateTime']>;
  /**
   * A unique, identifying string that appears on emails sent to the customer for
   * this invoice. This starts with the customer's unique invoice_prefix if it is specified.
   */
  number: Scalars['String'];
  /**
   * Whether payment was successfully collected for this invoice. An invoice can be
   * paid (most commonly) with a charge or with credit from the customer's account balance.
   */
  paid: Scalars['Boolean'];
  /**
   * The PaymentIntent associated with this invoice. The PaymentIntent is generated
   * when the invoice is finalized, and can then be used to pay the invoice.Note
   * that voiding an invoice will cancel the PaymentIntent
   */
  paymentIntent?: Maybe<StripePaymentIntentType>;
  /** End of the usage period during which invoice items were added to this invoice. */
  periodEnd: Scalars['DateTime'];
  /** Start of the usage period during which invoice items were added to this invoice. */
  periodStart: Scalars['DateTime'];
  pk?: Maybe<Scalars['String']>;
  /** Total amount (in cents) of all post-payment credit notes issued for this invoice. */
  postPaymentCreditNotesAmount?: Maybe<Scalars['Int']>;
  /** Total amount (in cents) of all pre-payment credit notes issued for this invoice. */
  prePaymentCreditNotesAmount?: Maybe<Scalars['Int']>;
  /** This is the transaction number that appears on email receipts sent for this invoice. */
  receiptNumber?: Maybe<Scalars['String']>;
  /**
   * Starting customer balance (in cents) before attempting to pay invoice. If the
   * invoice has not been attempted yet, this will be the current customer balance.
   */
  startingBalance: Scalars['Int'];
  /**
   * An arbitrary string to be displayed on your customer's credit card statement.
   * The statement description may not include <>"' characters, and will appear on
   * your customer's statement in capital letters. Non-ASCII characters are
   * automatically stripped. While most banks display this information
   * consistently, some may display it incorrectly or not at all.
   */
  statementDescriptor: Scalars['String'];
  /** The status of the invoice, one of draft, open, paid, uncollectible, or void. */
  status?: Maybe<InvoiceStatus>;
  statusTransitions?: Maybe<Scalars['String']>;
  /** The subscription that this invoice was prepared for, if any. */
  subscription?: Maybe<StripeSubscriptionType>;
  /** Only set for upcoming invoices that preview prorations. The time used to calculate prorations. */
  subscriptionProrationDate?: Maybe<Scalars['DateTime']>;
  /**
   * Total (as decimal) of all subscriptions, invoice items, and prorations on the
   * invoice before any discount or tax is applied.
   */
  subtotal: Scalars['Decimal'];
  /**
   * The amount (as decimal) of tax included in the total, calculated from
   * ``tax_percent`` and the subtotal. If no ``tax_percent`` is defined, this value will be null.
   */
  tax?: Maybe<Scalars['Decimal']>;
  /**
   * This percentage of the subtotal has been added to the total amount of the
   * invoice, including invoice line items and discounts. This field is inherited
   * from the subscription's ``tax_percent`` field, but can be changed before the
   * invoice is paid. This field defaults to null.
   */
  taxPercent?: Maybe<Scalars['Decimal']>;
  /**
   * If billing_reason is set to subscription_threshold this returns more
   * information on which threshold rules triggered the invoice.
   */
  thresholdReason?: Maybe<Scalars['String']>;
  total: Scalars['Decimal'];
  /**
   * The time at which webhooks for this invoice were successfully delivered (if
   * the invoice had no webhooks to deliver, this will match `date`). Invoice
   * payment is delayed until webhooks are delivered, or until all webhook delivery
   * attempts have been exhausted.
   */
  webhooksDeliveredAt?: Maybe<Scalars['DateTime']>;
}


export interface StripeInvoiceTypeChargesArgs {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}

export interface StripePaymentIntentType extends Node {
  __typename?: 'StripePaymentIntentType';
  /** Amount (in cents) intended to be collected by this PaymentIntent. */
  amount: Scalars['Int'];
  /** The client secret of this PaymentIntent. Used for client-side retrieval using a publishable key. */
  clientSecret: Scalars['String'];
  /** Three-letter ISO currency code */
  currency: Scalars['String'];
  /** The ID of the object. */
  id: Scalars['ID'];
  pk?: Maybe<Scalars['String']>;
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

export interface StripeSetupIntentType extends Node {
  __typename?: 'StripeSetupIntentType';
  /** ID of the Connect application that created the SetupIntent. */
  application: Scalars['String'];
  /** Reason for cancellation of this SetupIntent, one of abandoned, requested_by_customer, or duplicate */
  cancellationReason?: Maybe<SetupIntentCancellationReason>;
  /** The client secret of this SetupIntent. Used for client-side retrieval using a publishable key. */
  clientSecret: Scalars['String'];
  /** The datetime this object was created in stripe. */
  created?: Maybe<Scalars['DateTime']>;
  /** A description of this object. */
  description?: Maybe<Scalars['String']>;
  djstripeCreated: Scalars['DateTime'];
  djstripeId: Scalars['ID'];
  djstripeUpdated: Scalars['DateTime'];
  /** The ID of the object. */
  id: Scalars['ID'];
  /** The error encountered in the previous SetupIntent confirmation. */
  lastSetupError?: Maybe<Scalars['String']>;
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
  /** If present, this property tells you what actions you need to take inorder for your customer to continue payment setup. */
  nextAction?: Maybe<Scalars['String']>;
  /** Payment method used in this PaymentIntent. */
  paymentMethod?: Maybe<StripePaymentMethodType>;
  /** The list of payment method types (e.g. card) that this PaymentIntent is allowed to use. */
  paymentMethodTypes: Scalars['String'];
  pk?: Maybe<Scalars['String']>;
  /**
   * Status of this SetupIntent, one of requires_payment_method,
   * requires_confirmation, requires_action, processing, canceled, or succeeded.
   */
  status: SetupIntentStatus;
  /** Indicates how the payment method is intended to be used in the future. */
  usage: SetupIntentUsage;
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
  plan?: Maybe<SubscriptionPlanType>;
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

export interface UpdateDefaultPaymentMethodMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
}

export interface UpdateDefaultPaymentMethodMutationPayload {
  __typename?: 'UpdateDefaultPaymentMethodMutationPayload';
  activeSubscription?: Maybe<SubscriptionScheduleType>;
  clientMutationId?: Maybe<Scalars['String']>;
  paymentMethodEdge?: Maybe<PaymentMethodEdge>;
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

export interface UpdatePaymentIntentMutationInput {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  product: Scalars['String'];
}

export interface UpdatePaymentIntentMutationPayload {
  __typename?: 'UpdatePaymentIntentMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  paymentIntent?: Maybe<StripePaymentIntentType>;
}

export interface UserProfileType extends Node {
  __typename?: 'UserProfileType';
  firstName: Scalars['String'];
  /** The ID of the object. */
  id: Scalars['ID'];
  lastName: Scalars['String'];
  user: CurrentUserType;
}
