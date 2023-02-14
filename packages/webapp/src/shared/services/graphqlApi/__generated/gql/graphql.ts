/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
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
  /** The 'Dimension' type represents dimensions as whole numeric values between `1` and `4000`. */
  Dimension: any;
  /**
   * The `GenericScalar` scalar type represents a generic
   * GraphQL scalar value that could be:
   * String, Boolean, Int, Float, List or Object.
   */
  GenericScalar: any;
  /** The 'HexColor' type represents color in `rgb:ffffff` string format. */
  HexColor: any;
  /**
   * Allows use of a JSON String for input / output from the GraphQL schema.
   *
   * Use of this type is *not recommended* as you lose the benefits of having a defined, static
   * schema (one of the key benefits of GraphQL).
   */
  JSONString: any;
  /** The 'Quality' type represents quality as whole numeric values between `1` and `100`. */
  Quality: any;
  /**
   * Create scalar that ignores normal serialization/deserialization, since
   * that will be handled by the multipart request spec
   */
  Upload: any;
};

export type ApiMutation = {
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
};


export type ApiMutationCancelActiveSubscriptionArgs = {
  input: CancelActiveSubscriptionMutationInput;
};


export type ApiMutationChangeActiveSubscriptionArgs = {
  input: ChangeActiveSubscriptionMutationInput;
};


export type ApiMutationChangePasswordArgs = {
  input: ChangePasswordMutationInput;
};


export type ApiMutationConfirmArgs = {
  input: ConfirmEmailMutationInput;
};


export type ApiMutationCreateCrudDemoItemArgs = {
  input: CreateCrudDemoItemMutationInput;
};


export type ApiMutationCreateDocumentDemoItemArgs = {
  input: CreateDocumentDemoItemMutationInput;
};


export type ApiMutationCreateFavoriteContentfulDemoItemArgs = {
  input: CreateFavoriteContentfulDemoItemMutationInput;
};


export type ApiMutationCreatePaymentIntentArgs = {
  input: CreatePaymentIntentMutationInput;
};


export type ApiMutationCreateSetupIntentArgs = {
  input: CreateSetupIntentMutationInput;
};


export type ApiMutationDeleteCrudDemoItemArgs = {
  input: DeleteCrudDemoItemMutationInput;
};


export type ApiMutationDeleteDocumentDemoItemArgs = {
  input: DeleteDocumentDemoItemMutationInput;
};


export type ApiMutationDeleteFavoriteContentfulDemoItemArgs = {
  input: DeleteFavoriteContentfulDemoItemMutationInput;
};


export type ApiMutationDeletePaymentMethodArgs = {
  input: DeletePaymentMethodMutationInput;
};


export type ApiMutationMarkReadAllNotificationsArgs = {
  input: MarkReadAllNotificationsMutationInput;
};


export type ApiMutationPasswordResetArgs = {
  input: PasswordResetMutationInput;
};


export type ApiMutationPasswordResetConfirmArgs = {
  input: PasswordResetConfirmationMutationInput;
};


export type ApiMutationSignUpArgs = {
  input: SingUpMutationInput;
};


export type ApiMutationTokenAuthArgs = {
  input: ObtainTokenMutationInput;
};


export type ApiMutationUpdateCrudDemoItemArgs = {
  input: UpdateCrudDemoItemMutationInput;
};


export type ApiMutationUpdateCurrentUserArgs = {
  input: UpdateCurrentUserMutationInput;
};


export type ApiMutationUpdateDefaultPaymentMethodArgs = {
  input: UpdateDefaultPaymentMethodMutationInput;
};


export type ApiMutationUpdateNotificationArgs = {
  input: UpdateNotificationMutationInput;
};


export type ApiMutationUpdatePaymentIntentArgs = {
  input: UpdatePaymentIntentMutationInput;
};

export type ApiSubscription = {
  __typename?: 'ApiSubscription';
  notificationCreated?: Maybe<NotificationConnection>;
};


export type ApiSubscriptionNotificationCreatedArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export type AppConfig = Entry & {
  __typename?: 'AppConfig';
  contentfulMetadata: ContentfulMetadata;
  linkedFrom?: Maybe<AppConfigLinkingCollections>;
  name?: Maybe<Scalars['String']>;
  privacyPolicy?: Maybe<Scalars['String']>;
  sys: Sys;
  termsAndConditions?: Maybe<Scalars['String']>;
};


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export type AppConfigLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export type AppConfigNameArgs = {
  locale?: InputMaybe<Scalars['String']>;
};


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export type AppConfigPrivacyPolicyArgs = {
  locale?: InputMaybe<Scalars['String']>;
};


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/appConfig) */
export type AppConfigTermsAndConditionsArgs = {
  locale?: InputMaybe<Scalars['String']>;
};

export type AppConfigCollection = {
  __typename?: 'AppConfigCollection';
  items: Array<Maybe<AppConfig>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
};

export type AppConfigFilter = {
  AND?: InputMaybe<Array<InputMaybe<AppConfigFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<AppConfigFilter>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
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
  sys?: InputMaybe<SysFilter>;
  termsAndConditions?: InputMaybe<Scalars['String']>;
  termsAndConditions_contains?: InputMaybe<Scalars['String']>;
  termsAndConditions_exists?: InputMaybe<Scalars['Boolean']>;
  termsAndConditions_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  termsAndConditions_not?: InputMaybe<Scalars['String']>;
  termsAndConditions_not_contains?: InputMaybe<Scalars['String']>;
  termsAndConditions_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type AppConfigLinkingCollections = {
  __typename?: 'AppConfigLinkingCollections';
  entryCollection?: Maybe<EntryCollection>;
};


export type AppConfigLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export enum AppConfigOrder {
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC'
}

/** Represents a binary file in a space. An asset can be any file type. */
export type Asset = {
  __typename?: 'Asset';
  contentType?: Maybe<Scalars['String']>;
  contentfulMetadata: ContentfulMetadata;
  description?: Maybe<Scalars['String']>;
  fileName?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Int']>;
  linkedFrom?: Maybe<AssetLinkingCollections>;
  size?: Maybe<Scalars['Int']>;
  sys: Sys;
  title?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Int']>;
};


/** Represents a binary file in a space. An asset can be any file type. */
export type AssetContentTypeArgs = {
  locale?: InputMaybe<Scalars['String']>;
};


/** Represents a binary file in a space. An asset can be any file type. */
export type AssetDescriptionArgs = {
  locale?: InputMaybe<Scalars['String']>;
};


/** Represents a binary file in a space. An asset can be any file type. */
export type AssetFileNameArgs = {
  locale?: InputMaybe<Scalars['String']>;
};


/** Represents a binary file in a space. An asset can be any file type. */
export type AssetHeightArgs = {
  locale?: InputMaybe<Scalars['String']>;
};


/** Represents a binary file in a space. An asset can be any file type. */
export type AssetLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


/** Represents a binary file in a space. An asset can be any file type. */
export type AssetSizeArgs = {
  locale?: InputMaybe<Scalars['String']>;
};


/** Represents a binary file in a space. An asset can be any file type. */
export type AssetTitleArgs = {
  locale?: InputMaybe<Scalars['String']>;
};


/** Represents a binary file in a space. An asset can be any file type. */
export type AssetUrlArgs = {
  locale?: InputMaybe<Scalars['String']>;
  transform?: InputMaybe<ImageTransformOptions>;
};


/** Represents a binary file in a space. An asset can be any file type. */
export type AssetWidthArgs = {
  locale?: InputMaybe<Scalars['String']>;
};

export type AssetCollection = {
  __typename?: 'AssetCollection';
  items: Array<Maybe<Asset>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
};

export type AssetFilter = {
  AND?: InputMaybe<Array<InputMaybe<AssetFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<AssetFilter>>>;
  contentType?: InputMaybe<Scalars['String']>;
  contentType_contains?: InputMaybe<Scalars['String']>;
  contentType_exists?: InputMaybe<Scalars['Boolean']>;
  contentType_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  contentType_not?: InputMaybe<Scalars['String']>;
  contentType_not_contains?: InputMaybe<Scalars['String']>;
  contentType_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
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
  sys?: InputMaybe<SysFilter>;
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
};

export type AssetLinkingCollections = {
  __typename?: 'AssetLinkingCollections';
  demoItemCollection?: Maybe<DemoItemCollection>;
  entryCollection?: Maybe<EntryCollection>;
};


export type AssetLinkingCollectionsDemoItemCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type AssetLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export enum AssetOrder {
  ContentTypeAsc = 'contentType_ASC',
  ContentTypeDesc = 'contentType_DESC',
  FileNameAsc = 'fileName_ASC',
  FileNameDesc = 'fileName_DESC',
  HeightAsc = 'height_ASC',
  HeightDesc = 'height_DESC',
  SizeAsc = 'size_ASC',
  SizeDesc = 'size_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  UrlAsc = 'url_ASC',
  UrlDesc = 'url_DESC',
  WidthAsc = 'width_ASC',
  WidthDesc = 'width_DESC'
}

export type CancelActiveSubscriptionMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
};

export type CancelActiveSubscriptionMutationPayload = {
  __typename?: 'CancelActiveSubscriptionMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  subscriptionSchedule?: Maybe<SubscriptionScheduleType>;
  subscriptionScheduleEdge?: Maybe<SubscriptionScheduleEdge>;
};

export type ChangeActiveSubscriptionMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  price: Scalars['String'];
};

export type ChangeActiveSubscriptionMutationPayload = {
  __typename?: 'ChangeActiveSubscriptionMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  subscriptionSchedule?: Maybe<SubscriptionScheduleType>;
  subscriptionScheduleEdge?: Maybe<SubscriptionScheduleEdge>;
};

export type ChangePasswordMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** New password */
  newPassword: Scalars['String'];
  /** Old password */
  oldPassword: Scalars['String'];
};

export type ChangePasswordMutationPayload = {
  __typename?: 'ChangePasswordMutationPayload';
  access?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  refresh?: Maybe<Scalars['String']>;
};

export type ChargeConnection = {
  __typename?: 'ChargeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ChargeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `Charge` and its cursor. */
export type ChargeEdge = {
  __typename?: 'ChargeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<StripeChargeType>;
};

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

export type ConfirmEmailMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  token: Scalars['String'];
  user: Scalars['String'];
};

export type ConfirmEmailMutationPayload = {
  __typename?: 'ConfirmEmailMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
};

export type ContentfulDemoItemFavoriteConnection = {
  __typename?: 'ContentfulDemoItemFavoriteConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ContentfulDemoItemFavoriteEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ContentfulDemoItemFavorite` and its cursor. */
export type ContentfulDemoItemFavoriteEdge = {
  __typename?: 'ContentfulDemoItemFavoriteEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ContentfulDemoItemFavoriteType>;
};

export type ContentfulDemoItemFavoriteType = Node & {
  __typename?: 'ContentfulDemoItemFavoriteType';
  createdAt: Scalars['DateTime'];
  /** The ID of the object. */
  id: Scalars['ID'];
  item: ContentfulDemoItemType;
  updatedAt: Scalars['DateTime'];
  user: CurrentUserType;
};

export type ContentfulDemoItemFavoriteTypeConnection = {
  __typename?: 'ContentfulDemoItemFavoriteTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ContentfulDemoItemFavoriteTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ContentfulDemoItemFavoriteType` and its cursor. */
export type ContentfulDemoItemFavoriteTypeEdge = {
  __typename?: 'ContentfulDemoItemFavoriteTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ContentfulDemoItemFavoriteType>;
};

export type ContentfulDemoItemType = Node & {
  __typename?: 'ContentfulDemoItemType';
  contentfuldemoitemfavoriteSet: ContentfulDemoItemFavoriteTypeConnection;
  fields: Scalars['JSONString'];
  /** The ID of the object. */
  id: Scalars['ID'];
  isPublished: Scalars['Boolean'];
  pk?: Maybe<Scalars['String']>;
};


export type ContentfulDemoItemTypeContentfuldemoitemfavoriteSetArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

export type ContentfulMetadata = {
  __typename?: 'ContentfulMetadata';
  tags: Array<Maybe<ContentfulTag>>;
};

export type ContentfulMetadataFilter = {
  tags?: InputMaybe<ContentfulMetadataTagsFilter>;
  tags_exists?: InputMaybe<Scalars['Boolean']>;
};

export type ContentfulMetadataTagsFilter = {
  id_contains_all?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_contains_none?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_contains_some?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

/**
 * Represents a tag entity for finding and organizing content easily.
 *     Find out more here: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/content-tags
 */
export type ContentfulTag = {
  __typename?: 'ContentfulTag';
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type CreateCrudDemoItemMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  createdBy?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateCrudDemoItemMutationPayload = {
  __typename?: 'CreateCrudDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  crudDemoItem?: Maybe<CrudDemoItemType>;
  crudDemoItemEdge?: Maybe<CrudDemoItemEdge>;
};

export type CreateDocumentDemoItemMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  createdBy?: InputMaybe<Scalars['String']>;
  file?: InputMaybe<Scalars['Upload']>;
};

export type CreateDocumentDemoItemMutationPayload = {
  __typename?: 'CreateDocumentDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  documentDemoItem?: Maybe<DocumentDemoItemType>;
  documentDemoItemEdge?: Maybe<DocumentDemoItemEdge>;
};

export type CreateFavoriteContentfulDemoItemMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  item: Scalars['String'];
  user?: InputMaybe<Scalars['String']>;
};

export type CreateFavoriteContentfulDemoItemMutationPayload = {
  __typename?: 'CreateFavoriteContentfulDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  contentfulDemoItemFavorite?: Maybe<ContentfulDemoItemFavoriteType>;
  contentfulDemoItemFavoriteEdge?: Maybe<ContentfulDemoItemFavoriteEdge>;
};

export type CreatePaymentIntentMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  product: Scalars['String'];
};

export type CreatePaymentIntentMutationPayload = {
  __typename?: 'CreatePaymentIntentMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  paymentIntent?: Maybe<StripePaymentIntentType>;
};

export type CreateSetupIntentMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
};

export type CreateSetupIntentMutationPayload = {
  __typename?: 'CreateSetupIntentMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  setupIntent?: Maybe<StripeSetupIntentType>;
};

export type CrudDemoItemConnection = {
  __typename?: 'CrudDemoItemConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<CrudDemoItemEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `CrudDemoItem` and its cursor. */
export type CrudDemoItemEdge = {
  __typename?: 'CrudDemoItemEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<CrudDemoItemType>;
};

export type CrudDemoItemType = Node & {
  __typename?: 'CrudDemoItemType';
  createdBy?: Maybe<CurrentUserType>;
  /** The ID of the object. */
  id: Scalars['ID'];
  name: Scalars['String'];
};

/** A Relay edge containing a `CurrentUser` and its cursor. */
export type CurrentUserEdge = {
  __typename?: 'CurrentUserEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<UserProfileType>;
};

export type CurrentUserType = {
  __typename?: 'CurrentUserType';
  avatar?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  lastName?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DeleteCrudDemoItemMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
};

export type DeleteCrudDemoItemMutationPayload = {
  __typename?: 'DeleteCrudDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  deletedIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type DeleteDocumentDemoItemMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
};

export type DeleteDocumentDemoItemMutationPayload = {
  __typename?: 'DeleteDocumentDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  deletedIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type DeleteFavoriteContentfulDemoItemMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  item?: InputMaybe<Scalars['String']>;
};

export type DeleteFavoriteContentfulDemoItemMutationPayload = {
  __typename?: 'DeleteFavoriteContentfulDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  deletedIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type DeletePaymentMethodMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
};

export type DeletePaymentMethodMutationPayload = {
  __typename?: 'DeletePaymentMethodMutationPayload';
  activeSubscription?: Maybe<SubscriptionScheduleType>;
  clientMutationId?: Maybe<Scalars['String']>;
  deletedIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export type DemoItem = Entry & {
  __typename?: 'DemoItem';
  contentfulMetadata: ContentfulMetadata;
  description?: Maybe<Scalars['String']>;
  image?: Maybe<Asset>;
  linkedFrom?: Maybe<DemoItemLinkingCollections>;
  sys: Sys;
  title?: Maybe<Scalars['String']>;
};


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export type DemoItemDescriptionArgs = {
  locale?: InputMaybe<Scalars['String']>;
};


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export type DemoItemImageArgs = {
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
};


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export type DemoItemLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


/** [See type definition](https://app.contentful.com/spaces/m7e7pnsr61vp/content_types/demoItem) */
export type DemoItemTitleArgs = {
  locale?: InputMaybe<Scalars['String']>;
};

export type DemoItemCollection = {
  __typename?: 'DemoItemCollection';
  items: Array<Maybe<DemoItem>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
};

export type DemoItemFilter = {
  AND?: InputMaybe<Array<InputMaybe<DemoItemFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<DemoItemFilter>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  description?: InputMaybe<Scalars['String']>;
  description_contains?: InputMaybe<Scalars['String']>;
  description_exists?: InputMaybe<Scalars['Boolean']>;
  description_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  description_not?: InputMaybe<Scalars['String']>;
  description_not_contains?: InputMaybe<Scalars['String']>;
  description_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  image_exists?: InputMaybe<Scalars['Boolean']>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']>;
  title_contains?: InputMaybe<Scalars['String']>;
  title_exists?: InputMaybe<Scalars['Boolean']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title_not?: InputMaybe<Scalars['String']>;
  title_not_contains?: InputMaybe<Scalars['String']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type DemoItemLinkingCollections = {
  __typename?: 'DemoItemLinkingCollections';
  entryCollection?: Maybe<EntryCollection>;
};


export type DemoItemLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export enum DemoItemOrder {
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC'
}

export type DocumentDemoItemConnection = {
  __typename?: 'DocumentDemoItemConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<DocumentDemoItemEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `DocumentDemoItem` and its cursor. */
export type DocumentDemoItemEdge = {
  __typename?: 'DocumentDemoItemEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<DocumentDemoItemType>;
};

export type DocumentDemoItemType = Node & {
  __typename?: 'DocumentDemoItemType';
  createdAt: Scalars['DateTime'];
  createdBy?: Maybe<CurrentUserType>;
  file?: Maybe<FileFieldType>;
  /** The ID of the object. */
  id: Scalars['ID'];
};

export type Entry = {
  contentfulMetadata: ContentfulMetadata;
  sys: Sys;
};

export type EntryCollection = {
  __typename?: 'EntryCollection';
  items: Array<Maybe<Entry>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
};

export type EntryFilter = {
  AND?: InputMaybe<Array<InputMaybe<EntryFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<EntryFilter>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  sys?: InputMaybe<SysFilter>;
};

export enum EntryOrder {
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC'
}

export type FileFieldType = {
  __typename?: 'FileFieldType';
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export enum ImageFormat {
  Avif = 'AVIF',
  /** JPG image format. */
  Jpg = 'JPG',
  /**
   * Progressive JPG format stores multiple passes of an image in progressively higher detail.
   *         When a progressive image is loading, the viewer will first see a lower quality pixelated version which
   *         will gradually improve in detail, until the image is fully downloaded. This is to display an image as
   *         early as possible to make the layout look as designed.
   */
  JpgProgressive = 'JPG_PROGRESSIVE',
  /** PNG image format */
  Png = 'PNG',
  /**
   * 8-bit PNG images support up to 256 colors and weigh less than the standard 24-bit PNG equivalent.
   *         The 8-bit PNG format is mostly used for simple images, such as icons or logos.
   */
  Png8 = 'PNG8',
  /** WebP image format. */
  Webp = 'WEBP'
}

export enum ImageResizeFocus {
  /** Focus the resizing on the bottom. */
  Bottom = 'BOTTOM',
  /** Focus the resizing on the bottom left. */
  BottomLeft = 'BOTTOM_LEFT',
  /** Focus the resizing on the bottom right. */
  BottomRight = 'BOTTOM_RIGHT',
  /** Focus the resizing on the center. */
  Center = 'CENTER',
  /** Focus the resizing on the largest face. */
  Face = 'FACE',
  /** Focus the resizing on the area containing all the faces. */
  Faces = 'FACES',
  /** Focus the resizing on the left. */
  Left = 'LEFT',
  /** Focus the resizing on the right. */
  Right = 'RIGHT',
  /** Focus the resizing on the top. */
  Top = 'TOP',
  /** Focus the resizing on the top left. */
  TopLeft = 'TOP_LEFT',
  /** Focus the resizing on the top right. */
  TopRight = 'TOP_RIGHT'
}

export enum ImageResizeStrategy {
  /** Crops a part of the original image to fit into the specified dimensions. */
  Crop = 'CROP',
  /** Resizes the image to the specified dimensions, cropping the image if needed. */
  Fill = 'FILL',
  /** Resizes the image to fit into the specified dimensions. */
  Fit = 'FIT',
  /**
   * Resizes the image to the specified dimensions, padding the image if needed.
   *         Uses desired background color as padding color.
   */
  Pad = 'PAD',
  /** Resizes the image to the specified dimensions, changing the original aspect ratio if needed. */
  Scale = 'SCALE',
  /** Creates a thumbnail from the image. */
  Thumb = 'THUMB'
}

export type ImageTransformOptions = {
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
  format?: InputMaybe<ImageFormat>;
  /** Desired height in pixels. Defaults to the original image height. */
  height?: InputMaybe<Scalars['Dimension']>;
  /**
   * Desired quality of the image in percents.
   *         Used for `PNG8`, `JPG`, `JPG_PROGRESSIVE` and `WEBP` formats.
   */
  quality?: InputMaybe<Scalars['Quality']>;
  /** Desired resize focus area. Defaults to `CENTER`. */
  resizeFocus?: InputMaybe<ImageResizeFocus>;
  /** Desired resize strategy. Defaults to `FIT`. */
  resizeStrategy?: InputMaybe<ImageResizeStrategy>;
  /** Desired width in pixels. Defaults to the original image width. */
  width?: InputMaybe<Scalars['Dimension']>;
};

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

export type MarkReadAllNotificationsMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
};

export type MarkReadAllNotificationsMutationPayload = {
  __typename?: 'MarkReadAllNotificationsMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
};

/** An object with an ID */
export type Node = {
  /** The ID of the object. */
  id: Scalars['ID'];
};

export type NotificationConnection = {
  __typename?: 'NotificationConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<NotificationEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `Notification` and its cursor. */
export type NotificationEdge = {
  __typename?: 'NotificationEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<NotificationType>;
};

export type NotificationType = Node & {
  __typename?: 'NotificationType';
  createdAt: Scalars['DateTime'];
  data?: Maybe<Scalars['GenericScalar']>;
  /** The ID of the object. */
  id: Scalars['ID'];
  readAt?: Maybe<Scalars['DateTime']>;
  type: Scalars['String'];
  user: CurrentUserType;
};

export type ObtainTokenMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  password: Scalars['String'];
};

export type ObtainTokenMutationPayload = {
  __typename?: 'ObtainTokenMutationPayload';
  access?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  refresh?: Maybe<Scalars['String']>;
};

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

export type PasswordResetConfirmationMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** New password */
  newPassword: Scalars['String'];
  /** Token */
  token: Scalars['String'];
  user: Scalars['String'];
};

export type PasswordResetConfirmationMutationPayload = {
  __typename?: 'PasswordResetConfirmationMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
};

export type PasswordResetMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** User e-mail */
  email: Scalars['String'];
};

export type PasswordResetMutationPayload = {
  __typename?: 'PasswordResetMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  ok?: Maybe<Scalars['Boolean']>;
};

export type PaymentMethodConnection = {
  __typename?: 'PaymentMethodConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<PaymentMethodEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `PaymentMethod` and its cursor. */
export type PaymentMethodEdge = {
  __typename?: 'PaymentMethodEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<StripePaymentMethodType>;
};

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

export type Query = {
  __typename?: 'Query';
  activeSubscription?: Maybe<SubscriptionScheduleType>;
  allCharges?: Maybe<ChargeConnection>;
  allContentfulDemoItemFavorites?: Maybe<ContentfulDemoItemFavoriteConnection>;
  allCrudDemoItems?: Maybe<CrudDemoItemConnection>;
  allDocumentDemoItems?: Maybe<DocumentDemoItemConnection>;
  allNotifications?: Maybe<NotificationConnection>;
  allPaymentMethods?: Maybe<PaymentMethodConnection>;
  allSubscriptionPlans?: Maybe<SubscriptionPlanConnection>;
  appConfig?: Maybe<AppConfig>;
  appConfigCollection?: Maybe<AppConfigCollection>;
  asset?: Maybe<Asset>;
  assetCollection?: Maybe<AssetCollection>;
  charge?: Maybe<StripeChargeType>;
  crudDemoItem?: Maybe<CrudDemoItemType>;
  currentUser?: Maybe<CurrentUserType>;
  demoItem?: Maybe<DemoItem>;
  demoItemCollection?: Maybe<DemoItemCollection>;
  entryCollection?: Maybe<EntryCollection>;
  hasUnreadNotifications?: Maybe<Scalars['Boolean']>;
  node?: Maybe<Node>;
  paymentIntent?: Maybe<StripePaymentIntentType>;
};


export type QueryAllChargesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryAllContentfulDemoItemFavoritesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryAllCrudDemoItemsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryAllDocumentDemoItemsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryAllNotificationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryAllPaymentMethodsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryAllSubscriptionPlansArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryAppConfigArgs = {
  id: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
};


export type QueryAppConfigCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Array<InputMaybe<AppConfigOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<AppConfigFilter>;
};


export type QueryAssetArgs = {
  id: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
};


export type QueryAssetCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Array<InputMaybe<AssetOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<AssetFilter>;
};


export type QueryChargeArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryCrudDemoItemArgs = {
  id: Scalars['ID'];
};


export type QueryDemoItemArgs = {
  id: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  preview?: InputMaybe<Scalars['Boolean']>;
};


export type QueryDemoItemCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Array<InputMaybe<DemoItemOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<DemoItemFilter>;
};


export type QueryEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  locale?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Array<InputMaybe<EntryOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<EntryFilter>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
};


export type QueryPaymentIntentArgs = {
  id?: InputMaybe<Scalars['ID']>;
};

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

export type SingUpMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
};

export type SingUpMutationPayload = {
  __typename?: 'SingUpMutationPayload';
  access?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  refresh?: Maybe<Scalars['String']>;
};

export type StripeChargeType = Node & {
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
};

export type StripeChargeTypeConnection = {
  __typename?: 'StripeChargeTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<StripeChargeTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `StripeChargeType` and its cursor. */
export type StripeChargeTypeEdge = {
  __typename?: 'StripeChargeTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<StripeChargeType>;
};

export type StripeInvoiceType = Node & {
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
};


export type StripeInvoiceTypeChargesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

export type StripePaymentIntentType = Node & {
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
};

export type StripePaymentMethodType = Node & {
  __typename?: 'StripePaymentMethodType';
  billingDetails?: Maybe<Scalars['GenericScalar']>;
  card?: Maybe<Scalars['GenericScalar']>;
  /** The ID of the object. */
  id: Scalars['ID'];
  pk?: Maybe<Scalars['String']>;
  /** The type of the PaymentMethod. */
  type: PaymentMethodType;
};

export type StripeProductType = Node & {
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
};


export type StripeProductTypePricesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

export type StripeSetupIntentType = Node & {
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
};

export type StripeSubscriptionType = Node & {
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
};

export type StripeSubscriptionTypeConnection = {
  __typename?: 'StripeSubscriptionTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<StripeSubscriptionTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `StripeSubscriptionType` and its cursor. */
export type StripeSubscriptionTypeEdge = {
  __typename?: 'StripeSubscriptionTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<StripeSubscriptionType>;
};

export type SubscriptionPlanConnection = {
  __typename?: 'SubscriptionPlanConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SubscriptionPlanEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `SubscriptionPlan` and its cursor. */
export type SubscriptionPlanEdge = {
  __typename?: 'SubscriptionPlanEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<SubscriptionPlanType>;
};

export type SubscriptionPlanType = Node & {
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
};

export type SubscriptionPlanTypeConnection = {
  __typename?: 'SubscriptionPlanTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SubscriptionPlanTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `SubscriptionPlanType` and its cursor. */
export type SubscriptionPlanTypeEdge = {
  __typename?: 'SubscriptionPlanTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<SubscriptionPlanType>;
};

/** A Relay edge containing a `SubscriptionSchedule` and its cursor. */
export type SubscriptionScheduleEdge = {
  __typename?: 'SubscriptionScheduleEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<SubscriptionScheduleType>;
};

/** An enumeration. */
export enum SubscriptionScheduleEndBehavior {
  /** Cancel */
  Cancel = 'CANCEL',
  /** Release */
  Release = 'RELEASE'
}

export type SubscriptionSchedulePhaseItemType = {
  __typename?: 'SubscriptionSchedulePhaseItemType';
  price?: Maybe<SubscriptionPlanType>;
  quantity?: Maybe<Scalars['Int']>;
};

export type SubscriptionSchedulePhaseType = {
  __typename?: 'SubscriptionSchedulePhaseType';
  endDate?: Maybe<Scalars['String']>;
  item?: Maybe<SubscriptionSchedulePhaseItemType>;
  startDate?: Maybe<Scalars['DateTime']>;
  trialEnd?: Maybe<Scalars['String']>;
};

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

export type SubscriptionScheduleType = Node & {
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
};


export type SubscriptionScheduleTypeSubscriptionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

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

export type Sys = {
  __typename?: 'Sys';
  environmentId: Scalars['String'];
  firstPublishedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['String'];
  publishedAt?: Maybe<Scalars['DateTime']>;
  publishedVersion?: Maybe<Scalars['Int']>;
  spaceId: Scalars['String'];
};

export type SysFilter = {
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
};

export type UpdateCrudDemoItemMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  createdBy?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type UpdateCrudDemoItemMutationPayload = {
  __typename?: 'UpdateCrudDemoItemMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  crudDemoItem?: Maybe<CrudDemoItemType>;
  crudDemoItemEdge?: Maybe<CrudDemoItemEdge>;
};

export type UpdateCurrentUserMutationInput = {
  avatar?: InputMaybe<Scalars['Upload']>;
  clientMutationId?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
};

export type UpdateCurrentUserMutationPayload = {
  __typename?: 'UpdateCurrentUserMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  userProfile?: Maybe<UserProfileType>;
  userProfileEdge?: Maybe<CurrentUserEdge>;
};

export type UpdateDefaultPaymentMethodMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
};

export type UpdateDefaultPaymentMethodMutationPayload = {
  __typename?: 'UpdateDefaultPaymentMethodMutationPayload';
  activeSubscription?: Maybe<SubscriptionScheduleType>;
  clientMutationId?: Maybe<Scalars['String']>;
  paymentMethodEdge?: Maybe<PaymentMethodEdge>;
};

export type UpdateNotificationMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  isRead?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateNotificationMutationPayload = {
  __typename?: 'UpdateNotificationMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  hasUnreadNotifications?: Maybe<Scalars['Boolean']>;
  notification?: Maybe<NotificationType>;
  notificationEdge?: Maybe<NotificationEdge>;
};

export type UpdatePaymentIntentMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  product: Scalars['String'];
};

export type UpdatePaymentIntentMutationPayload = {
  __typename?: 'UpdatePaymentIntentMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  paymentIntent?: Maybe<StripePaymentIntentType>;
};

export type UserProfileType = Node & {
  __typename?: 'UserProfileType';
  firstName: Scalars['String'];
  /** The ID of the object. */
  id: Scalars['ID'];
  lastName: Scalars['String'];
  user: CurrentUserType;
};

export type CommonQueryCurrentUserFragmentFragment = { __typename?: 'CurrentUserType', id: string, email: string, firstName?: string | null, lastName?: string | null, roles?: Array<string | null> | null, avatar?: string | null } & { ' $fragmentName'?: 'CommonQueryCurrentUserFragmentFragment' };

export type CommonQueryCurrentUserQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CommonQueryCurrentUserQueryQuery = { __typename?: 'Query', currentUser?: (
    { __typename?: 'CurrentUserType' }
    & { ' $fragmentRefs'?: { 'CommonQueryCurrentUserFragmentFragment': CommonQueryCurrentUserFragmentFragment } }
  ) | null };

export type ConfigContentfulAppConfigQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ConfigContentfulAppConfigQueryQuery = { __typename?: 'Query', appConfigCollection?: { __typename?: 'AppConfigCollection', items: Array<{ __typename?: 'AppConfig', name?: string | null, privacyPolicy?: string | null, termsAndConditions?: string | null } | null> } | null };

export type StripeCreateSetupIntentMutationMutationVariables = Exact<{
  input: CreateSetupIntentMutationInput;
}>;


export type StripeCreateSetupIntentMutationMutation = { __typename?: 'ApiMutation', createSetupIntent?: { __typename?: 'CreateSetupIntentMutationPayload', setupIntent?: (
      { __typename?: 'StripeSetupIntentType' }
      & { ' $fragmentRefs'?: { 'StripeSetupIntentFragmentFragment': StripeSetupIntentFragmentFragment } }
    ) | null } | null };

export type StripePaymentMethodFragmentFragment = { __typename?: 'StripePaymentMethodType', id: string, pk?: string | null, type: PaymentMethodType, card?: any | null, billingDetails?: any | null } & { ' $fragmentName'?: 'StripePaymentMethodFragmentFragment' };

export type StripeAllPaymentMethodsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type StripeAllPaymentMethodsQueryQuery = { __typename?: 'Query', allPaymentMethods?: { __typename?: 'PaymentMethodConnection', edges: Array<{ __typename?: 'PaymentMethodEdge', node?: (
        { __typename?: 'StripePaymentMethodType' }
        & { ' $fragmentRefs'?: { 'StripePaymentMethodFragmentFragment': StripePaymentMethodFragmentFragment } }
      ) | null } | null> } | null };

export type StripePaymentIntentFragmentFragment = { __typename?: 'StripePaymentIntentType', id: string, amount: number, clientSecret: string, currency: string, pk?: string | null } & { ' $fragmentName'?: 'StripePaymentIntentFragmentFragment' };

export type StripePaymentIntentQueryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type StripePaymentIntentQueryQuery = { __typename?: 'Query', paymentIntent?: (
    { __typename?: 'StripePaymentIntentType' }
    & { ' $fragmentRefs'?: { 'StripePaymentIntentFragmentFragment': StripePaymentIntentFragmentFragment } }
  ) | null };

export type SubscriptionActivePlanDetailsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SubscriptionActivePlanDetailsQueryQuery = { __typename?: 'Query', activeSubscription?: (
    { __typename?: 'SubscriptionScheduleType' }
    & { ' $fragmentRefs'?: { 'SubscriptionActiveSubscriptionFragmentFragment': SubscriptionActiveSubscriptionFragmentFragment } }
  ) | null };

export type AuthConfirmUserEmailMutationMutationVariables = Exact<{
  input: ConfirmEmailMutationInput;
}>;


export type AuthConfirmUserEmailMutationMutation = { __typename?: 'ApiMutation', confirm?: { __typename?: 'ConfirmEmailMutationPayload', ok?: boolean | null } | null };

export type AddCrudDemoItemMutationMutationVariables = Exact<{
  input: CreateCrudDemoItemMutationInput;
}>;


export type AddCrudDemoItemMutationMutation = { __typename?: 'ApiMutation', createCrudDemoItem?: { __typename?: 'CreateCrudDemoItemMutationPayload', crudDemoItemEdge?: { __typename?: 'CrudDemoItemEdge', node?: { __typename?: 'CrudDemoItemType', id: string, name: string } | null } | null } | null };

export type CrudDemoItemDetailsQueryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type CrudDemoItemDetailsQueryQuery = { __typename?: 'Query', crudDemoItem?: { __typename?: 'CrudDemoItemType', id: string, name: string } | null };

export type CrudDemoItemListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CrudDemoItemListQueryQuery = { __typename?: 'Query', allCrudDemoItems?: { __typename?: 'CrudDemoItemConnection', edges: Array<{ __typename?: 'CrudDemoItemEdge', node?: (
        { __typename?: 'CrudDemoItemType', id: string }
        & { ' $fragmentRefs'?: { 'CrudDemoItemListItemFragment': CrudDemoItemListItemFragment } }
      ) | null } | null> } | null };

export type CrudDemoItemListItemTestQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CrudDemoItemListItemTestQueryQuery = { __typename?: 'Query', item?: (
    { __typename?: 'CrudDemoItemType' }
    & { ' $fragmentRefs'?: { 'CrudDemoItemListItemFragment': CrudDemoItemListItemFragment } }
  ) | null };

export type CrudDemoItemListItemDeleteMutationMutationVariables = Exact<{
  input: DeleteCrudDemoItemMutationInput;
}>;


export type CrudDemoItemListItemDeleteMutationMutation = { __typename?: 'ApiMutation', deleteCrudDemoItem?: { __typename?: 'DeleteCrudDemoItemMutationPayload', deletedIds?: Array<string | null> | null } | null };

export type CrudDemoItemListItemFragment = { __typename?: 'CrudDemoItemType', id: string, name: string } & { ' $fragmentName'?: 'CrudDemoItemListItemFragment' };

export type CrudDemoItemListItemDefaultStoryQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CrudDemoItemListItemDefaultStoryQueryQuery = { __typename?: 'Query', item?: (
    { __typename?: 'CrudDemoItemType' }
    & { ' $fragmentRefs'?: { 'CrudDemoItemListItemFragment': CrudDemoItemListItemFragment } }
  ) | null };

export type EditCrudDemoItemQueryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type EditCrudDemoItemQueryQuery = { __typename?: 'Query', crudDemoItem?: { __typename?: 'CrudDemoItemType', id: string, name: string } | null };

export type EditCrudDemoItemContentMutationMutationVariables = Exact<{
  input: UpdateCrudDemoItemMutationInput;
}>;


export type EditCrudDemoItemContentMutationMutation = { __typename?: 'ApiMutation', updateCrudDemoItem?: { __typename?: 'UpdateCrudDemoItemMutationPayload', crudDemoItem?: { __typename?: 'CrudDemoItemType', id: string, name: string } | null } | null };

export type DemoItemQueryQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type DemoItemQueryQuery = { __typename?: 'Query', demoItem?: { __typename?: 'DemoItem', title?: string | null, description?: string | null, image?: { __typename?: 'Asset', url?: string | null, title?: string | null, description?: string | null } | null } | null };

export type DemoItemListItemTestQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type DemoItemListItemTestQueryQuery = { __typename?: 'Query', testItem?: (
    { __typename?: 'DemoItem' }
    & { ' $fragmentRefs'?: { 'DemoItemListItem_ItemFragment': DemoItemListItem_ItemFragment } }
  ) | null };

export type DemoItemListItem_ItemFragment = { __typename?: 'DemoItem', title?: string | null, image?: { __typename?: 'Asset', title?: string | null, url?: string | null } | null } & { ' $fragmentName'?: 'DemoItemListItem_ItemFragment' };

export type DemoItemsAllQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type DemoItemsAllQueryQuery = { __typename?: 'Query', demoItemCollection?: { __typename?: 'DemoItemCollection', items: Array<(
      { __typename?: 'DemoItem', sys: { __typename?: 'Sys', id: string } }
      & { ' $fragmentRefs'?: { 'DemoItemListItem_ItemFragment': DemoItemListItem_ItemFragment } }
    ) | null> } | null };

export type DocumentListItemStoryQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type DocumentListItemStoryQueryQuery = { __typename?: 'Query', allDocumentDemoItems?: { __typename?: 'DocumentDemoItemConnection', edges: Array<{ __typename?: 'DocumentDemoItemEdge', node?: (
        { __typename?: 'DocumentDemoItemType' }
        & { ' $fragmentRefs'?: { 'DocumentListItemFragment': DocumentListItemFragment } }
      ) | null } | null> } | null };

export type DocumentListItemFragment = { __typename?: 'DocumentDemoItemType', id: string, createdAt: any, file?: { __typename?: 'FileFieldType', url?: string | null, name?: string | null } | null } & { ' $fragmentName'?: 'DocumentListItemFragment' };

export type DocumentsListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type DocumentsListQueryQuery = { __typename?: 'Query', allDocumentDemoItems?: { __typename?: 'DocumentDemoItemConnection', edges: Array<{ __typename?: 'DocumentDemoItemEdge', node?: (
        { __typename?: 'DocumentDemoItemType', id: string, createdAt: any }
        & { ' $fragmentRefs'?: { 'DocumentListItemFragment': DocumentListItemFragment } }
      ) | null } | null> } | null };

export type DocumentsListCreateMutationMutationVariables = Exact<{
  input: CreateDocumentDemoItemMutationInput;
  connections: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type DocumentsListCreateMutationMutation = { __typename?: 'ApiMutation', createDocumentDemoItem?: { __typename?: 'CreateDocumentDemoItemMutationPayload', documentDemoItemEdge?: { __typename?: 'DocumentDemoItemEdge', node?: { __typename?: 'DocumentDemoItemType', createdAt: any, file?: { __typename?: 'FileFieldType', name?: string | null, url?: string | null } | null } | null } | null } | null };

export type DocumentsDeleteMutationMutationVariables = Exact<{
  input: DeleteDocumentDemoItemMutationInput;
  connections: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type DocumentsDeleteMutationMutation = { __typename?: 'ApiMutation', deleteDocumentDemoItem?: { __typename?: 'DeleteDocumentDemoItemMutationPayload', deletedIds?: Array<string | null> | null } | null };

export type SubscriptionCancelActiveSubscriptionMutationMutationVariables = Exact<{
  input: CancelActiveSubscriptionMutationInput;
}>;


export type SubscriptionCancelActiveSubscriptionMutationMutation = { __typename?: 'ApiMutation', cancelActiveSubscription?: { __typename?: 'CancelActiveSubscriptionMutationPayload', subscriptionSchedule?: (
      { __typename?: 'SubscriptionScheduleType', id: string }
      & { ' $fragmentRefs'?: { 'SubscriptionActiveSubscriptionFragmentFragment': SubscriptionActiveSubscriptionFragmentFragment } }
    ) | null } | null };

export type StripeCreateSetupIntentMutation_MutationVariables = Exact<{
  input: CreateSetupIntentMutationInput;
}>;


export type StripeCreateSetupIntentMutation_Mutation = { __typename?: 'ApiMutation', createSetupIntent?: { __typename?: 'CreateSetupIntentMutationPayload', setupIntent?: (
      { __typename?: 'StripeSetupIntentType', id: string }
      & { ' $fragmentRefs'?: { 'StripeSetupIntentFragmentFragment': StripeSetupIntentFragmentFragment } }
    ) | null } | null };

export type StripeSetupIntentFragmentFragment = { __typename?: 'StripeSetupIntentType', id: string, clientSecret: string } & { ' $fragmentName'?: 'StripeSetupIntentFragmentFragment' };

export type SubscriptionChangeActiveSubscriptionMutationMutationVariables = Exact<{
  input: ChangeActiveSubscriptionMutationInput;
}>;


export type SubscriptionChangeActiveSubscriptionMutationMutation = { __typename?: 'ApiMutation', changeActiveSubscription?: { __typename?: 'ChangeActiveSubscriptionMutationPayload', subscriptionSchedule?: (
      { __typename?: 'SubscriptionScheduleType', id: string }
      & { ' $fragmentRefs'?: { 'SubscriptionActiveSubscriptionFragmentFragment': SubscriptionActiveSubscriptionFragmentFragment } }
    ) | null } | null };

export type SubscriptionPlansAllQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SubscriptionPlansAllQueryQuery = { __typename?: 'Query', allSubscriptionPlans?: { __typename?: 'SubscriptionPlanConnection', edges: Array<{ __typename?: 'SubscriptionPlanEdge', node?: (
        { __typename?: 'SubscriptionPlanType', id: string }
        & { ' $fragmentRefs'?: { 'SubscriptionPlanItemFragmentFragment': SubscriptionPlanItemFragmentFragment } }
      ) | null } | null> } | null };

export type SubscriptionPlanItemFragmentFragment = { __typename?: 'SubscriptionPlanType', id: string, pk?: string | null, unitAmount?: number | null, product: { __typename?: 'StripeProductType', id: string, name: string } } & { ' $fragmentName'?: 'SubscriptionPlanItemFragmentFragment' };

export type StripeAllChargesQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type StripeAllChargesQueryQuery = { __typename?: 'Query', allCharges?: { __typename?: 'ChargeConnection', edges: Array<{ __typename?: 'ChargeEdge', node?: (
        { __typename?: 'StripeChargeType', id: string }
        & { ' $fragmentRefs'?: { 'StripeChargeFragmentFragment': StripeChargeFragmentFragment } }
      ) | null } | null> } | null };

export type StripeChargeFragmentFragment = { __typename?: 'StripeChargeType', id: string, created?: any | null, billingDetails?: any | null, amount: any, paymentMethod?: (
    { __typename?: 'StripePaymentMethodType', id: string }
    & { ' $fragmentRefs'?: { 'StripePaymentMethodFragmentFragment': StripePaymentMethodFragmentFragment } }
  ) | null, invoice?: { __typename?: 'StripeInvoiceType', id: string, subscription?: { __typename?: 'StripeSubscriptionType', plan?: (
        { __typename?: 'SubscriptionPlanType' }
        & { ' $fragmentRefs'?: { 'SubscriptionPlanItemFragmentFragment': SubscriptionPlanItemFragmentFragment } }
      ) | null } | null } | null } & { ' $fragmentName'?: 'StripeChargeFragmentFragment' };

export type AuthChangePasswordMutationMutationVariables = Exact<{
  input: ChangePasswordMutationInput;
}>;


export type AuthChangePasswordMutationMutation = { __typename?: 'ApiMutation', changePassword?: { __typename?: 'ChangePasswordMutationPayload', access?: string | null, refresh?: string | null } | null };

export type AuthUpdateUserProfileMutationMutationVariables = Exact<{
  input: UpdateCurrentUserMutationInput;
}>;


export type AuthUpdateUserProfileMutationMutation = { __typename?: 'ApiMutation', updateCurrentUser?: { __typename?: 'UpdateCurrentUserMutationPayload', userProfile?: { __typename?: 'UserProfileType', id: string, user: (
        { __typename?: 'CurrentUserType' }
        & { ' $fragmentRefs'?: { 'CommonQueryCurrentUserFragmentFragment': CommonQueryCurrentUserFragmentFragment } }
      ) } | null } | null };

export type LoginFormMutationMutationVariables = Exact<{
  input: ObtainTokenMutationInput;
}>;


export type LoginFormMutationMutation = { __typename?: 'ApiMutation', tokenAuth?: { __typename?: 'ObtainTokenMutationPayload', access?: string | null, refresh?: string | null } | null };

export type AuthRequestPasswordResetConfirmMutationMutationVariables = Exact<{
  input: PasswordResetConfirmationMutationInput;
}>;


export type AuthRequestPasswordResetConfirmMutationMutation = { __typename?: 'ApiMutation', passwordResetConfirm?: { __typename?: 'PasswordResetConfirmationMutationPayload', ok?: boolean | null } | null };

export type AuthRequestPasswordResetMutationMutationVariables = Exact<{
  input: PasswordResetMutationInput;
}>;


export type AuthRequestPasswordResetMutationMutation = { __typename?: 'ApiMutation', passwordReset?: { __typename?: 'PasswordResetMutationPayload', ok?: boolean | null } | null };

export type AuthSignupMutationMutationVariables = Exact<{
  input: SingUpMutationInput;
}>;


export type AuthSignupMutationMutation = { __typename?: 'ApiMutation', signUp?: { __typename?: 'SingUpMutationPayload', access?: string | null, refresh?: string | null } | null };

export type StripeCreatePaymentIntentMutation_MutationVariables = Exact<{
  input: CreatePaymentIntentMutationInput;
}>;


export type StripeCreatePaymentIntentMutation_Mutation = { __typename?: 'ApiMutation', createPaymentIntent?: { __typename?: 'CreatePaymentIntentMutationPayload', paymentIntent?: (
      { __typename?: 'StripePaymentIntentType', id: string }
      & { ' $fragmentRefs'?: { 'StripePaymentIntentFragmentFragment': StripePaymentIntentFragmentFragment } }
    ) | null } | null };

export type StripeUpdatePaymentIntentMutation_MutationVariables = Exact<{
  input: UpdatePaymentIntentMutationInput;
}>;


export type StripeUpdatePaymentIntentMutation_Mutation = { __typename?: 'ApiMutation', updatePaymentIntent?: { __typename?: 'UpdatePaymentIntentMutationPayload', paymentIntent?: (
      { __typename?: 'StripePaymentIntentType', id: string }
      & { ' $fragmentRefs'?: { 'StripePaymentIntentFragmentFragment': StripePaymentIntentFragmentFragment } }
    ) | null } | null };

export type StripeSubscriptionQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type StripeSubscriptionQueryQuery = { __typename?: 'Query', allPaymentMethods?: { __typename?: 'PaymentMethodConnection', edges: Array<{ __typename?: 'PaymentMethodEdge', cursor: string, node?: (
        { __typename: 'StripePaymentMethodType', id: string, pk?: string | null, type: PaymentMethodType, card?: any | null, billingDetails?: any | null }
        & { ' $fragmentRefs'?: { 'StripePaymentMethodFragmentFragment': StripePaymentMethodFragmentFragment } }
      ) | null } | null>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean } } | null, activeSubscription?: (
    { __typename: 'SubscriptionScheduleType', id: string }
    & { ' $fragmentRefs'?: { 'SubscriptionActiveSubscriptionFragmentFragment': SubscriptionActiveSubscriptionFragmentFragment } }
  ) | null };

export type StripeDeletePaymentMethodMutationMutationVariables = Exact<{
  input: DeletePaymentMethodMutationInput;
}>;


export type StripeDeletePaymentMethodMutationMutation = { __typename?: 'ApiMutation', deletePaymentMethod?: { __typename?: 'DeletePaymentMethodMutationPayload', deletedIds?: Array<string | null> | null, activeSubscription?: { __typename?: 'SubscriptionScheduleType', defaultPaymentMethod?: (
        { __typename?: 'StripePaymentMethodType' }
        & { ' $fragmentRefs'?: { 'StripePaymentMethodFragmentFragment': StripePaymentMethodFragmentFragment } }
      ) | null } | null } | null };

export type StripeUpdateDefaultPaymentMethodMutationMutationVariables = Exact<{
  input: UpdateDefaultPaymentMethodMutationInput;
}>;


export type StripeUpdateDefaultPaymentMethodMutationMutation = { __typename?: 'ApiMutation', updateDefaultPaymentMethod?: { __typename?: 'UpdateDefaultPaymentMethodMutationPayload', activeSubscription?: (
      { __typename?: 'SubscriptionScheduleType', id: string }
      & { ' $fragmentRefs'?: { 'SubscriptionActiveSubscriptionFragmentFragment': SubscriptionActiveSubscriptionFragmentFragment } }
    ) | null, paymentMethodEdge?: { __typename?: 'PaymentMethodEdge', node?: (
        { __typename?: 'StripePaymentMethodType', id: string }
        & { ' $fragmentRefs'?: { 'StripePaymentMethodFragmentFragment': StripePaymentMethodFragmentFragment } }
      ) | null } | null } | null };

export type NotificationMutationMutationVariables = Exact<{
  input: UpdateNotificationMutationInput;
}>;


export type NotificationMutationMutation = { __typename?: 'ApiMutation', updateNotification?: { __typename?: 'UpdateNotificationMutationPayload', hasUnreadNotifications?: boolean | null, notificationEdge?: { __typename?: 'NotificationEdge', node?: { __typename?: 'NotificationType', id: string, readAt?: any | null } | null } | null } | null };

export type NotificationsListQueryQueryVariables = Exact<{
  count?: InputMaybe<Scalars['Int']>;
  cursor?: InputMaybe<Scalars['String']>;
}>;


export type NotificationsListQueryQuery = (
  { __typename?: 'Query' }
  & { ' $fragmentRefs'?: { 'NotificationsListContentFragmentFragment': NotificationsListContentFragmentFragment;'NotificationsButtonContentFragment': NotificationsButtonContentFragment } }
);

export type NotificationsListSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NotificationsListSubscriptionSubscription = { __typename?: 'ApiSubscription', notificationCreated?: { __typename?: 'NotificationConnection', edges: Array<{ __typename?: 'NotificationEdge', node?: { __typename?: 'NotificationType', id: string, type: string, createdAt: any, readAt?: any | null, data?: any | null } | null } | null> } | null };

export type NotificationsButtonContentFragment = { __typename?: 'Query', hasUnreadNotifications?: boolean | null } & { ' $fragmentName'?: 'NotificationsButtonContentFragment' };

export type NotificationsListContentFragmentFragment = { __typename?: 'Query', hasUnreadNotifications?: boolean | null, allNotifications?: { __typename?: 'NotificationConnection', edges: Array<{ __typename?: 'NotificationEdge', node?: { __typename?: 'NotificationType', id: string, data?: any | null, createdAt: any, readAt?: any | null, type: string } | null } | null>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean } } | null } & { ' $fragmentName'?: 'NotificationsListContentFragmentFragment' };

export type NotificationsListMarkAsReadMutationMutationVariables = Exact<{
  input: MarkReadAllNotificationsMutationInput;
}>;


export type NotificationsListMarkAsReadMutationMutation = { __typename?: 'ApiMutation', markReadAllNotifications?: { __typename?: 'MarkReadAllNotificationsMutationPayload', ok?: boolean | null } | null };

export type SubscriptionActiveSubscriptionFragmentFragment = { __typename?: 'SubscriptionScheduleType', canActivateTrial?: boolean | null, phases?: Array<{ __typename?: 'SubscriptionSchedulePhaseType', startDate?: any | null, endDate?: string | null, trialEnd?: string | null, item?: { __typename?: 'SubscriptionSchedulePhaseItemType', quantity?: number | null, price?: (
        { __typename?: 'SubscriptionPlanType', id: string }
        & { ' $fragmentRefs'?: { 'SubscriptionPlanItemFragmentFragment': SubscriptionPlanItemFragmentFragment } }
      ) | null } | null } | null> | null, subscription?: { __typename?: 'StripeSubscriptionType', startDate?: any | null, trialEnd?: any | null, trialStart?: any | null, id: string } | null, defaultPaymentMethod?: (
    { __typename?: 'StripePaymentMethodType', id: string }
    & { ' $fragmentRefs'?: { 'StripePaymentMethodFragment_Fragment': StripePaymentMethodFragment_Fragment } }
  ) | null } & { ' $fragmentName'?: 'SubscriptionActiveSubscriptionFragmentFragment' };

export type StripePaymentMethodFragment_Fragment = { __typename?: 'StripePaymentMethodType', id: string, pk?: string | null, type: PaymentMethodType, card?: any | null, billingDetails?: any | null } & { ' $fragmentName'?: 'StripePaymentMethodFragment_Fragment' };

export type SubscriptionActivePlanDetailsQuery_QueryVariables = Exact<{ [key: string]: never; }>;


export type SubscriptionActivePlanDetailsQuery_Query = { __typename?: 'Query', activeSubscription?: (
    { __typename?: 'SubscriptionScheduleType', id: string }
    & { ' $fragmentRefs'?: { 'SubscriptionActiveSubscriptionFragmentFragment': SubscriptionActiveSubscriptionFragmentFragment } }
  ) | null };

export type UseFavoriteDemoItemListCreateMutationMutationVariables = Exact<{
  input: CreateFavoriteContentfulDemoItemMutationInput;
  connections: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type UseFavoriteDemoItemListCreateMutationMutation = { __typename?: 'ApiMutation', createFavoriteContentfulDemoItem?: { __typename?: 'CreateFavoriteContentfulDemoItemMutationPayload', contentfulDemoItemFavoriteEdge?: { __typename?: 'ContentfulDemoItemFavoriteEdge', node?: (
        { __typename?: 'ContentfulDemoItemFavoriteType' }
        & { ' $fragmentRefs'?: { 'UseFavoriteDemoItem_ItemFragment': UseFavoriteDemoItem_ItemFragment } }
      ) | null } | null } | null };

export type UseFavoriteDemoItemListDeleteMutationMutationVariables = Exact<{
  input: DeleteFavoriteContentfulDemoItemMutationInput;
  connections: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type UseFavoriteDemoItemListDeleteMutationMutation = { __typename?: 'ApiMutation', deleteFavoriteContentfulDemoItem?: { __typename?: 'DeleteFavoriteContentfulDemoItemMutationPayload', deletedIds?: Array<string | null> | null } | null };

export type UseFavoriteDemoItem_ItemFragment = { __typename?: 'ContentfulDemoItemFavoriteType', item: { __typename?: 'ContentfulDemoItemType', pk?: string | null } } & { ' $fragmentName'?: 'UseFavoriteDemoItem_ItemFragment' };

export type UseFavoriteDemoItemListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type UseFavoriteDemoItemListQueryQuery = { __typename?: 'Query', allContentfulDemoItemFavorites?: { __typename?: 'ContentfulDemoItemFavoriteConnection', edges: Array<{ __typename?: 'ContentfulDemoItemFavoriteEdge', node?: (
        { __typename?: 'ContentfulDemoItemFavoriteType' }
        & { ' $fragmentRefs'?: { 'UseFavoriteDemoItem_ItemFragment': UseFavoriteDemoItem_ItemFragment } }
      ) | null } | null> } | null };

export const CommonQueryCurrentUserFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonQueryCurrentUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrentUserType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]} as unknown as DocumentNode<CommonQueryCurrentUserFragmentFragment, unknown>;
export const StripePaymentIntentFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"stripePaymentIntentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StripePaymentIntentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"clientSecret"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"pk"}}]}}]} as unknown as DocumentNode<StripePaymentIntentFragmentFragment, unknown>;
export const CrudDemoItemListItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"crudDemoItemListItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CrudDemoItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<CrudDemoItemListItemFragment, unknown>;
export const DemoItemListItem_ItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"demoItemListItem_item"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DemoItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<DemoItemListItem_ItemFragment, unknown>;
export const DocumentListItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"documentListItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DocumentDemoItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<DocumentListItemFragment, unknown>;
export const StripeSetupIntentFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"stripeSetupIntentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StripeSetupIntentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"clientSecret"}}]}}]} as unknown as DocumentNode<StripeSetupIntentFragmentFragment, unknown>;
export const StripePaymentMethodFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"stripePaymentMethodFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StripePaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pk"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"card"}},{"kind":"Field","name":{"kind":"Name","value":"billingDetails"}}]}}]} as unknown as DocumentNode<StripePaymentMethodFragmentFragment, unknown>;
export const SubscriptionPlanItemFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"subscriptionPlanItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionPlanType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pk"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitAmount"}}]}}]} as unknown as DocumentNode<SubscriptionPlanItemFragmentFragment, unknown>;
export const StripeChargeFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"stripeChargeFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StripeChargeType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"billingDetails"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripePaymentMethodFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"invoice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionPlanItemFragment"}}]}}]}}]}}]}},...StripePaymentMethodFragmentFragmentDoc.definitions,...SubscriptionPlanItemFragmentFragmentDoc.definitions]} as unknown as DocumentNode<StripeChargeFragmentFragment, unknown>;
export const NotificationsButtonContentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"notificationsButtonContent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasUnreadNotifications"}}]}}]} as unknown as DocumentNode<NotificationsButtonContentFragment, unknown>;
export const NotificationsListContentFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"notificationsListContentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasUnreadNotifications"}},{"kind":"Field","name":{"kind":"Name","value":"allNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"count"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<NotificationsListContentFragmentFragment, unknown>;
export const StripePaymentMethodFragment_FragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"stripePaymentMethodFragment_"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StripePaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pk"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"card"}},{"kind":"Field","name":{"kind":"Name","value":"billingDetails"}}]}}]} as unknown as DocumentNode<StripePaymentMethodFragment_Fragment, unknown>;
export const SubscriptionActiveSubscriptionFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"subscriptionActiveSubscriptionFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionScheduleType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phases"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"trialEnd"}},{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionPlanItemFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"trialEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialStart"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"canActivateTrial"}},{"kind":"Field","name":{"kind":"Name","value":"defaultPaymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripePaymentMethodFragment_"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},...SubscriptionPlanItemFragmentFragmentDoc.definitions,...StripePaymentMethodFragment_FragmentDoc.definitions]} as unknown as DocumentNode<SubscriptionActiveSubscriptionFragmentFragment, unknown>;
export const UseFavoriteDemoItem_ItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"useFavoriteDemoItem_item"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContentfulDemoItemFavoriteType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pk"}}]}}]}}]} as unknown as DocumentNode<UseFavoriteDemoItem_ItemFragment, unknown>;
export const CommonQueryCurrentUserQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"commonQueryCurrentUserQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonQueryCurrentUserFragment"}}]}}]}},...CommonQueryCurrentUserFragmentFragmentDoc.definitions]} as unknown as DocumentNode<CommonQueryCurrentUserQueryQuery, CommonQueryCurrentUserQueryQueryVariables>;
export const ConfigContentfulAppConfigQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"configContentfulAppConfigQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"appConfigCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"privacyPolicy"}},{"kind":"Field","name":{"kind":"Name","value":"termsAndConditions"}}]}}]}}]}}]} as unknown as DocumentNode<ConfigContentfulAppConfigQueryQuery, ConfigContentfulAppConfigQueryQueryVariables>;
export const StripeCreateSetupIntentMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"stripeCreateSetupIntentMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSetupIntentMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSetupIntent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setupIntent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripeSetupIntentFragment"}}]}}]}}]}},...StripeSetupIntentFragmentFragmentDoc.definitions]} as unknown as DocumentNode<StripeCreateSetupIntentMutationMutation, StripeCreateSetupIntentMutationMutationVariables>;
export const StripeAllPaymentMethodsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"stripeAllPaymentMethodsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allPaymentMethods"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"stripe_allPaymentMethods","block":false}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripePaymentMethodFragment"}}]}}]}}]}}]}},...StripePaymentMethodFragmentFragmentDoc.definitions]} as unknown as DocumentNode<StripeAllPaymentMethodsQueryQuery, StripeAllPaymentMethodsQueryQueryVariables>;
export const StripePaymentIntentQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"stripePaymentIntentQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentIntent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripePaymentIntentFragment"}}]}}]}},...StripePaymentIntentFragmentFragmentDoc.definitions]} as unknown as DocumentNode<StripePaymentIntentQueryQuery, StripePaymentIntentQueryQueryVariables>;
export const SubscriptionActivePlanDetailsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"subscriptionActivePlanDetailsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionActiveSubscriptionFragment"}}]}}]}},...SubscriptionActiveSubscriptionFragmentFragmentDoc.definitions]} as unknown as DocumentNode<SubscriptionActivePlanDetailsQueryQuery, SubscriptionActivePlanDetailsQueryQueryVariables>;
export const AuthConfirmUserEmailMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"authConfirmUserEmailMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConfirmEmailMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirm"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}}]}}]}}]} as unknown as DocumentNode<AuthConfirmUserEmailMutationMutation, AuthConfirmUserEmailMutationMutationVariables>;
export const AddCrudDemoItemMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"addCrudDemoItemMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCrudDemoItemMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCrudDemoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crudDemoItemEdge"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AddCrudDemoItemMutationMutation, AddCrudDemoItemMutationMutationVariables>;
export const CrudDemoItemDetailsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"crudDemoItemDetailsQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crudDemoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CrudDemoItemDetailsQueryQuery, CrudDemoItemDetailsQueryQueryVariables>;
export const CrudDemoItemListQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"crudDemoItemListQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allCrudDemoItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"crudDemoItemListItem"}}]}}]}}]}}]}},...CrudDemoItemListItemFragmentDoc.definitions]} as unknown as DocumentNode<CrudDemoItemListQueryQuery, CrudDemoItemListQueryQueryVariables>;
export const CrudDemoItemListItemTestQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"crudDemoItemListItemTestQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"item"},"name":{"kind":"Name","value":"crudDemoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"StringValue","value":"test-id","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"crudDemoItemListItem"}}]}}]}},...CrudDemoItemListItemFragmentDoc.definitions]} as unknown as DocumentNode<CrudDemoItemListItemTestQueryQuery, CrudDemoItemListItemTestQueryQueryVariables>;
export const CrudDemoItemListItemDeleteMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"crudDemoItemListItemDeleteMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteCrudDemoItemMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCrudDemoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletedIds"}}]}}]}}]} as unknown as DocumentNode<CrudDemoItemListItemDeleteMutationMutation, CrudDemoItemListItemDeleteMutationMutationVariables>;
export const CrudDemoItemListItemDefaultStoryQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"crudDemoItemListItemDefaultStoryQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"item"},"name":{"kind":"Name","value":"crudDemoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"StringValue","value":"test-id","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"crudDemoItemListItem"}}]}}]}},...CrudDemoItemListItemFragmentDoc.definitions]} as unknown as DocumentNode<CrudDemoItemListItemDefaultStoryQueryQuery, CrudDemoItemListItemDefaultStoryQueryQueryVariables>;
export const EditCrudDemoItemQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"editCrudDemoItemQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crudDemoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<EditCrudDemoItemQueryQuery, EditCrudDemoItemQueryQueryVariables>;
export const EditCrudDemoItemContentMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"editCrudDemoItemContentMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCrudDemoItemMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCrudDemoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crudDemoItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<EditCrudDemoItemContentMutationMutation, EditCrudDemoItemContentMutationMutationVariables>;
export const DemoItemQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"demoItemQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"demoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<DemoItemQueryQuery, DemoItemQueryQueryVariables>;
export const DemoItemListItemTestQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"demoItemListItemTestQuery"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"relay_test_operation"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"testItem"},"name":{"kind":"Name","value":"demoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"StringValue","value":"contentful-item-1","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"demoItemListItem_item"}}]}}]}},...DemoItemListItem_ItemFragmentDoc.definitions]} as unknown as DocumentNode<DemoItemListItemTestQueryQuery, DemoItemListItemTestQueryQueryVariables>;
export const DemoItemsAllQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"demoItemsAllQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"demoItemCollection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"demoItemListItem_item"}}]}}]}}]}},...DemoItemListItem_ItemFragmentDoc.definitions]} as unknown as DocumentNode<DemoItemsAllQueryQuery, DemoItemsAllQueryQueryVariables>;
export const DocumentListItemStoryQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"documentListItemStoryQuery"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"relay_test_operation"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allDocumentDemoItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"documentListItem"}}]}}]}}]}}]}},...DocumentListItemFragmentDoc.definitions]} as unknown as DocumentNode<DocumentListItemStoryQueryQuery, DocumentListItemStoryQueryQueryVariables>;
export const DocumentsListQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"documentsListQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allDocumentDemoItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"10"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"documentListItem"}}]}}]}}]}}]}},...DocumentListItemFragmentDoc.definitions]} as unknown as DocumentNode<DocumentsListQueryQuery, DocumentsListQueryQueryVariables>;
export const DocumentsListCreateMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"documentsListCreateMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDocumentDemoItemMutationInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"connections"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDocumentDemoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentDemoItemEdge"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"appendEdge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"connections"},"value":{"kind":"Variable","name":{"kind":"Name","value":"connections"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<DocumentsListCreateMutationMutation, DocumentsListCreateMutationMutationVariables>;
export const DocumentsDeleteMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"documentsDeleteMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteDocumentDemoItemMutationInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"connections"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDocumentDemoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletedIds"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"deleteEdge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"connections"},"value":{"kind":"Variable","name":{"kind":"Name","value":"connections"}}}]}]}]}}]}}]} as unknown as DocumentNode<DocumentsDeleteMutationMutation, DocumentsDeleteMutationMutationVariables>;
export const SubscriptionCancelActiveSubscriptionMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"subscriptionCancelActiveSubscriptionMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CancelActiveSubscriptionMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelActiveSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionSchedule"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionActiveSubscriptionFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},...SubscriptionActiveSubscriptionFragmentFragmentDoc.definitions]} as unknown as DocumentNode<SubscriptionCancelActiveSubscriptionMutationMutation, SubscriptionCancelActiveSubscriptionMutationMutationVariables>;
export const StripeCreateSetupIntentMutation_Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"stripeCreateSetupIntentMutation_"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSetupIntentMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSetupIntent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setupIntent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripeSetupIntentFragment"}}]}}]}}]}},...StripeSetupIntentFragmentFragmentDoc.definitions]} as unknown as DocumentNode<StripeCreateSetupIntentMutation_Mutation, StripeCreateSetupIntentMutation_MutationVariables>;
export const SubscriptionChangeActiveSubscriptionMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"subscriptionChangeActiveSubscriptionMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeActiveSubscriptionMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeActiveSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionSchedule"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionActiveSubscriptionFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},...SubscriptionActiveSubscriptionFragmentFragmentDoc.definitions]} as unknown as DocumentNode<SubscriptionChangeActiveSubscriptionMutationMutation, SubscriptionChangeActiveSubscriptionMutationMutationVariables>;
export const SubscriptionPlansAllQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"subscriptionPlansAllQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allSubscriptionPlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionPlanItemFragment"}}]}}]}}]}}]}},...SubscriptionPlanItemFragmentFragmentDoc.definitions]} as unknown as DocumentNode<SubscriptionPlansAllQueryQuery, SubscriptionPlansAllQueryQueryVariables>;
export const StripeAllChargesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"stripeAllChargesQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allCharges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripeChargeFragment"}}]}}]}}]}}]}},...StripeChargeFragmentFragmentDoc.definitions]} as unknown as DocumentNode<StripeAllChargesQueryQuery, StripeAllChargesQueryQueryVariables>;
export const AuthChangePasswordMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"authChangePasswordMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access"}},{"kind":"Field","name":{"kind":"Name","value":"refresh"}}]}}]}}]} as unknown as DocumentNode<AuthChangePasswordMutationMutation, AuthChangePasswordMutationMutationVariables>;
export const AuthUpdateUserProfileMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"authUpdateUserProfileMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCurrentUserMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCurrentUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonQueryCurrentUserFragment"}}]}}]}}]}}]}},...CommonQueryCurrentUserFragmentFragmentDoc.definitions]} as unknown as DocumentNode<AuthUpdateUserProfileMutationMutation, AuthUpdateUserProfileMutationMutationVariables>;
export const LoginFormMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"loginFormMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ObtainTokenMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tokenAuth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access"}},{"kind":"Field","name":{"kind":"Name","value":"refresh"}}]}}]}}]} as unknown as DocumentNode<LoginFormMutationMutation, LoginFormMutationMutationVariables>;
export const AuthRequestPasswordResetConfirmMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"authRequestPasswordResetConfirmMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PasswordResetConfirmationMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"passwordResetConfirm"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}}]}}]}}]} as unknown as DocumentNode<AuthRequestPasswordResetConfirmMutationMutation, AuthRequestPasswordResetConfirmMutationMutationVariables>;
export const AuthRequestPasswordResetMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"authRequestPasswordResetMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PasswordResetMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"passwordReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}}]}}]}}]} as unknown as DocumentNode<AuthRequestPasswordResetMutationMutation, AuthRequestPasswordResetMutationMutationVariables>;
export const AuthSignupMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"authSignupMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SingUpMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access"}},{"kind":"Field","name":{"kind":"Name","value":"refresh"}}]}}]}}]} as unknown as DocumentNode<AuthSignupMutationMutation, AuthSignupMutationMutationVariables>;
export const StripeCreatePaymentIntentMutation_Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"stripeCreatePaymentIntentMutation_"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePaymentIntentMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPaymentIntent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentIntent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripePaymentIntentFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},...StripePaymentIntentFragmentFragmentDoc.definitions]} as unknown as DocumentNode<StripeCreatePaymentIntentMutation_Mutation, StripeCreatePaymentIntentMutation_MutationVariables>;
export const StripeUpdatePaymentIntentMutation_Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"stripeUpdatePaymentIntentMutation_"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePaymentIntentMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePaymentIntent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentIntent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripePaymentIntentFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},...StripePaymentIntentFragmentFragmentDoc.definitions]} as unknown as DocumentNode<StripeUpdatePaymentIntentMutation_Mutation, StripeUpdatePaymentIntentMutation_MutationVariables>;
export const StripeSubscriptionQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"stripeSubscriptionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allPaymentMethods"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pk"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"card"}},{"kind":"Field","name":{"kind":"Name","value":"billingDetails"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripePaymentMethodFragment"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"activeSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionActiveSubscriptionFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}},...StripePaymentMethodFragmentFragmentDoc.definitions,...SubscriptionActiveSubscriptionFragmentFragmentDoc.definitions]} as unknown as DocumentNode<StripeSubscriptionQueryQuery, StripeSubscriptionQueryQueryVariables>;
export const StripeDeletePaymentMethodMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"stripeDeletePaymentMethodMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeletePaymentMethodMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePaymentMethod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletedIds"}},{"kind":"Field","name":{"kind":"Name","value":"activeSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defaultPaymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripePaymentMethodFragment"}}]}}]}}]}}]}},...StripePaymentMethodFragmentFragmentDoc.definitions]} as unknown as DocumentNode<StripeDeletePaymentMethodMutationMutation, StripeDeletePaymentMethodMutationMutationVariables>;
export const StripeUpdateDefaultPaymentMethodMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"stripeUpdateDefaultPaymentMethodMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateDefaultPaymentMethodMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDefaultPaymentMethod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionActiveSubscriptionFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodEdge"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"stripePaymentMethodFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}},...SubscriptionActiveSubscriptionFragmentFragmentDoc.definitions,...StripePaymentMethodFragmentFragmentDoc.definitions]} as unknown as DocumentNode<StripeUpdateDefaultPaymentMethodMutationMutation, StripeUpdateDefaultPaymentMethodMutationMutationVariables>;
export const NotificationMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"notificationMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateNotificationMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasUnreadNotifications"}},{"kind":"Field","name":{"kind":"Name","value":"notificationEdge"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]}}]}}]}}]} as unknown as DocumentNode<NotificationMutationMutation, NotificationMutationMutationVariables>;
export const NotificationsListQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"notificationsListQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"count"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"notificationsListContentFragment"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"notificationsButtonContent"}}]}},...NotificationsListContentFragmentFragmentDoc.definitions,...NotificationsButtonContentFragmentDoc.definitions]} as unknown as DocumentNode<NotificationsListQueryQuery, NotificationsListQueryQueryVariables>;
export const NotificationsListSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"notificationsListSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notificationCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]}}]}}]}}]} as unknown as DocumentNode<NotificationsListSubscriptionSubscription, NotificationsListSubscriptionSubscriptionVariables>;
export const NotificationsListMarkAsReadMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"notificationsListMarkAsReadMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MarkReadAllNotificationsMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markReadAllNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}}]}}]}}]} as unknown as DocumentNode<NotificationsListMarkAsReadMutationMutation, NotificationsListMarkAsReadMutationMutationVariables>;
export const SubscriptionActivePlanDetailsQuery_Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"subscriptionActivePlanDetailsQuery_"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionActiveSubscriptionFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},...SubscriptionActiveSubscriptionFragmentFragmentDoc.definitions]} as unknown as DocumentNode<SubscriptionActivePlanDetailsQuery_Query, SubscriptionActivePlanDetailsQuery_QueryVariables>;
export const UseFavoriteDemoItemListCreateMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"useFavoriteDemoItemListCreateMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFavoriteContentfulDemoItemMutationInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"connections"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFavoriteContentfulDemoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contentfulDemoItemFavoriteEdge"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"appendEdge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"connections"},"value":{"kind":"Variable","name":{"kind":"Name","value":"connections"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"useFavoriteDemoItem_item"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"relay"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"mask"},"value":{"kind":"BooleanValue","value":false}}]}]}]}}]}}]}}]}},...UseFavoriteDemoItem_ItemFragmentDoc.definitions]} as unknown as DocumentNode<UseFavoriteDemoItemListCreateMutationMutation, UseFavoriteDemoItemListCreateMutationMutationVariables>;
export const UseFavoriteDemoItemListDeleteMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"useFavoriteDemoItemListDeleteMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteFavoriteContentfulDemoItemMutationInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"connections"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFavoriteContentfulDemoItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletedIds"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"deleteEdge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"connections"},"value":{"kind":"Variable","name":{"kind":"Name","value":"connections"}}}]}]}]}}]}}]} as unknown as DocumentNode<UseFavoriteDemoItemListDeleteMutationMutation, UseFavoriteDemoItemListDeleteMutationMutationVariables>;
export const UseFavoriteDemoItemListQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"useFavoriteDemoItemListQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allContentfulDemoItemFavorites"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"useFavoriteDemoItemListQuery__allContentfulDemoItemFavorites","block":false}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"useFavoriteDemoItem_item"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"relay"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"mask"},"value":{"kind":"BooleanValue","value":false}}]}]}]}}]}}]}}]}},...UseFavoriteDemoItem_ItemFragmentDoc.definitions]} as unknown as DocumentNode<UseFavoriteDemoItemListQueryQuery, UseFavoriteDemoItemListQueryQueryVariables>;