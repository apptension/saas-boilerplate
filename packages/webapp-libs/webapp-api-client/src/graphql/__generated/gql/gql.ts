 
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query paginationListTestQuery($first: Int, $after: String, $last: Int, $before: String) {\n    allNotifications(first: $first, after: $after, last: $last, before: $before) {\n      edges {\n        node {\n          id\n        }\n      }\n      pageInfo {\n        startCursor\n        endCursor\n        hasPreviousPage\n        hasNextPage\n      }\n    }\n  }\n": types.PaginationListTestQueryDocument,
    "\n  fragment commonQueryCurrentUserFragment on CurrentUserType {\n    id\n    email\n    firstName\n    lastName\n    roles\n    avatar\n    otpVerified\n    otpEnabled\n  }\n": types.CommonQueryCurrentUserFragmentFragmentDoc,
    "\n  fragment commonQueryTenantItemFragment on TenantType {\n    id\n    name\n    type\n    membership {\n      ...commonQueryMembershipFragment\n    }\n  }\n": types.CommonQueryTenantItemFragmentFragmentDoc,
    "\n  fragment commonQueryMembershipFragment on TenantMembershipType {\n    id\n    role\n    invitationAccepted\n    inviteeEmailAddress\n    invitationToken\n    userId\n    firstName\n    lastName\n    userEmail\n    avatar\n  }\n": types.CommonQueryMembershipFragmentFragmentDoc,
    "\n  query commonQueryCurrentUserQuery {\n    currentUser {\n      ...commonQueryCurrentUserFragment\n      tenants {\n        ...commonQueryTenantItemFragment\n      }\n    }\n  }\n": types.CommonQueryCurrentUserQueryDocument,
    "\n  query configContentfulAppConfigQuery {\n    appConfigCollection(limit: 1) {\n      items {\n        name\n        privacyPolicy\n        termsAndConditions\n      }\n    }\n  }\n": types.ConfigContentfulAppConfigQueryDocument,
    "\n  mutation useFavoriteDemoItemListCreateMutation($input: CreateFavoriteContentfulDemoItemMutationInput!) {\n    createFavoriteContentfulDemoItem(input: $input) {\n      contentfulDemoItemFavoriteEdge {\n        node {\n          id\n          item {\n            pk\n          }\n        }\n      }\n    }\n  }\n": types.UseFavoriteDemoItemListCreateMutationDocument,
    "\n  fragment useFavoriteDemoItem_item on ContentfulDemoItemFavoriteType {\n    id\n    item {\n      pk\n    }\n  }\n": types.UseFavoriteDemoItem_ItemFragmentDoc,
    "\n  mutation useFavoriteDemoItemListDeleteMutation($input: DeleteFavoriteContentfulDemoItemMutationInput!) {\n    deleteFavoriteContentfulDemoItem(input: $input) {\n      deletedIds\n    }\n  }\n": types.UseFavoriteDemoItemListDeleteMutationDocument,
    "\n  query useFavoriteDemoItemListQuery {\n    allContentfulDemoItemFavorites(first: 100) {\n      edges {\n        node {\n          id\n          ...useFavoriteDemoItem_item\n        }\n      }\n    }\n  }\n": types.UseFavoriteDemoItemListQueryDocument,
    "\n  query demoItemQuery($id: String!) {\n    demoItem(id: $id) {\n      title\n      description\n      image {\n        url\n        title\n        description\n      }\n    }\n  }\n": types.DemoItemQueryDocument,
    "\n  fragment demoItemListItemFragment on DemoItem {\n    title\n    image {\n      title\n      url\n    }\n  }\n": types.DemoItemListItemFragmentFragmentDoc,
    "\n  query demoItemsAllQuery {\n    demoItemCollection {\n      items {\n        sys {\n          id\n        }\n        ...demoItemListItemFragment\n      }\n    }\n  }\n": types.DemoItemsAllQueryDocument,
    "\n  mutation addCrudDemoItemMutation($input: CreateCrudDemoItemMutationInput!) {\n    createCrudDemoItem(input: $input) {\n      crudDemoItemEdge {\n        node {\n          id\n          name\n        }\n      }\n    }\n  }\n": types.AddCrudDemoItemMutationDocument,
    "\n  query crudDemoItemDetailsQuery($id: ID!, $tenantId: ID!) {\n    crudDemoItem(id: $id, tenantId: $tenantId) {\n      id\n      name\n    }\n  }\n": types.CrudDemoItemDetailsQueryDocument,
    "\n  query crudDemoItemListQuery($tenantId: ID!, $first: Int, $after: String, $last: Int, $before: String) {\n    allCrudDemoItems(tenantId: $tenantId, first: $first, after: $after, last: $last, before: $before) {\n      edges {\n        node {\n          id\n          ...crudDemoItemListItem\n        }\n      }\n      pageInfo {\n        startCursor\n        endCursor\n        hasPreviousPage\n        hasNextPage\n      }\n    }\n  }\n": types.CrudDemoItemListQueryDocument,
    "\n  query crudDemoItemListItemTestQuery {\n    item: crudDemoItem(id: \"test-id\") {\n      ...crudDemoItemListItem\n    }\n  }\n": types.CrudDemoItemListItemTestQueryDocument,
    "\n  mutation crudDemoItemListItemDeleteMutation($input: DeleteCrudDemoItemMutationInput!) {\n    deleteCrudDemoItem(input: $input) {\n      deletedIds\n    }\n  }\n": types.CrudDemoItemListItemDeleteMutationDocument,
    "\n  fragment crudDemoItemListItem on CrudDemoItemType {\n    id\n    name\n  }\n": types.CrudDemoItemListItemFragmentDoc,
    "\n  query crudDemoItemListItemDefaultStoryQuery {\n    item: crudDemoItem(id: \"test-id\") {\n      ...crudDemoItemListItem\n    }\n  }\n": types.CrudDemoItemListItemDefaultStoryQueryDocument,
    "\n  query editCrudDemoItemQuery($id: ID!, $tenantId: ID!) {\n    crudDemoItem(id: $id, tenantId: $tenantId) {\n      id\n      name\n    }\n  }\n": types.EditCrudDemoItemQueryDocument,
    "\n  mutation editCrudDemoItemContentMutation($input: UpdateCrudDemoItemMutationInput!) {\n    updateCrudDemoItem(input: $input) {\n      crudDemoItem {\n        id\n        name\n      }\n    }\n  }\n": types.EditCrudDemoItemContentMutationDocument,
    "\n  fragment documentListItem on DocumentDemoItemType {\n    id\n    file {\n      url\n      name\n    }\n    createdAt\n  }\n": types.DocumentListItemFragmentDoc,
    "\n  query documentsListQuery {\n    allDocumentDemoItems(first: 10) {\n      edges {\n        node {\n          id\n          ...documentListItem\n        }\n      }\n    }\n  }\n": types.DocumentsListQueryDocument,
    "\n  mutation documentsListCreateMutation($input: CreateDocumentDemoItemMutationInput!) {\n    createDocumentDemoItem(input: $input) {\n      documentDemoItemEdge {\n        node {\n          id\n          ...documentListItem\n        }\n      }\n    }\n  }\n": types.DocumentsListCreateMutationDocument,
    "\n  mutation documentsDeleteMutation($input: DeleteDocumentDemoItemMutationInput!) {\n    deleteDocumentDemoItem(input: $input) {\n      deletedIds\n    }\n  }\n": types.DocumentsDeleteMutationDocument,
    "\n  fragment stripePaymentIntentFragment on StripePaymentIntentType {\n    id\n    amount\n    clientSecret\n    currency\n    pk\n  }\n": types.StripePaymentIntentFragmentFragmentDoc,
    "\n  mutation stripeCreatePaymentIntentMutation_($input: CreatePaymentIntentMutationInput!) {\n    createPaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n        id\n        amount\n        clientSecret\n        currency\n        pk\n      }\n    }\n  }\n": types.StripeCreatePaymentIntentMutation_Document,
    "\n  mutation stripeUpdatePaymentIntentMutation_($input: UpdatePaymentIntentMutationInput!) {\n    updatePaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n        id\n        amount\n        clientSecret\n        currency\n        pk\n      }\n    }\n  }\n": types.StripeUpdatePaymentIntentMutation_Document,
    "\n  fragment stripePaymentMethodFragment on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n": types.StripePaymentMethodFragmentFragmentDoc,
    "\n  query stripeSubscriptionQuery($tenantId: ID!) {\n    allPaymentMethods(tenantId: $tenantId, first: 100) {\n      edges {\n        node {\n          id\n          pk\n          type\n          card\n          billingDetails\n          ...stripePaymentMethodFragment\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n\n    activeSubscription(tenantId: $tenantId) {\n      ...subscriptionActiveSubscriptionFragment\n      id\n      __typename\n    }\n  }\n": types.StripeSubscriptionQueryDocument,
    "\n  mutation stripeDeletePaymentMethodMutation($input: DeletePaymentMethodMutationInput!) {\n    deletePaymentMethod(input: $input) {\n      deletedIds\n      activeSubscription {\n        defaultPaymentMethod {\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n": types.StripeDeletePaymentMethodMutationDocument,
    "\n  mutation stripeUpdateDefaultPaymentMethodMutation($input: UpdateDefaultPaymentMethodMutationInput!) {\n    updateDefaultPaymentMethod(input: $input) {\n      activeSubscription {\n        ...subscriptionActiveSubscriptionFragment\n        id\n      }\n      paymentMethodEdge {\n        node {\n          ...stripePaymentMethodFragment\n          id\n        }\n      }\n    }\n  }\n": types.StripeUpdateDefaultPaymentMethodMutationDocument,
    "\n  fragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          pk\n          product {\n            id\n            name\n          }\n          unitAmount\n          id\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n      id\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment_\n      id\n    }\n  }\n\n  fragment subscriptionPlanItemFragment on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    amount\n  }\n": types.SubscriptionActiveSubscriptionFragmentFragmentDoc,
    "\n  fragment subscriptionActiveSubscriptionDetailsFragment on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          ...subscriptionPriceItemFragment\n          id\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n      id\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment_\n      id\n    }\n  }\n\n  fragment stripePaymentMethodFragment_ on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n": types.SubscriptionActiveSubscriptionDetailsFragmentFragmentDoc,
    "\n  query subscriptionActivePlanDetailsQuery_($tenantId: ID!) {\n    activeSubscription(tenantId: $tenantId) {\n      ...subscriptionActiveSubscriptionFragment\n      id\n    }\n  }\n": types.SubscriptionActivePlanDetailsQuery_Document,
    "\n  mutation subscriptionCancelActiveSubscriptionMutation($input: CancelActiveSubscriptionMutationInput!) {\n    cancelActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n        id\n      }\n    }\n  }\n": types.SubscriptionCancelActiveSubscriptionMutationDocument,
    "\n  mutation stripeCreateSetupIntentMutation_($input: CreateSetupIntentMutationInput!) {\n    createSetupIntent(input: $input) {\n      setupIntent {\n        id\n        ...stripeSetupIntentFragment\n      }\n    }\n  }\n\n  fragment stripeSetupIntentFragment on StripeSetupIntentType {\n    id\n    clientSecret\n  }\n": types.StripeCreateSetupIntentMutation_Document,
    "\n  mutation subscriptionChangeActiveSubscriptionMutation($input: ChangeActiveSubscriptionMutationInput!) {\n    changeActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n        id\n      }\n    }\n  }\n": types.SubscriptionChangeActiveSubscriptionMutationDocument,
    "\n  query subscriptionPlansAllQuery {\n    allSubscriptionPlans(first: 100) {\n      edges {\n        node {\n          ...subscriptionPriceItemFragment\n          id\n          pk\n          product {\n            id\n            name\n          }\n          unitAmount\n        }\n      }\n    }\n  }\n": types.SubscriptionPlansAllQueryDocument,
    "\n  fragment subscriptionPriceItemFragment on StripePriceType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    unitAmount\n  }\n": types.SubscriptionPriceItemFragmentFragmentDoc,
    "\n  query stripeAllChargesQuery($tenantId: ID!) {\n    allCharges(tenantId: $tenantId) {\n      edges {\n        node {\n          id\n          ...stripeChargeFragment\n        }\n      }\n    }\n  }\n": types.StripeAllChargesQueryDocument,
    "\n  fragment stripeChargeFragment on StripeChargeType {\n    id\n    created\n    billingDetails\n    paymentMethod {\n      ...stripePaymentMethodFragment\n      id\n    }\n    amount\n    invoice {\n      id\n      subscription {\n        plan {\n          ...subscriptionPlanItemFragment\n        }\n      }\n    }\n  }\n": types.StripeChargeFragmentFragmentDoc,
    "\n  fragment subscriptionPlanItemFragment on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    amount\n  }\n": types.SubscriptionPlanItemFragmentFragmentDoc,
    "\n  mutation generateSaasIdeasMutation($input: GenerateSaasIdeasMutationInput!) {\n    generateSaasIdeas(input: $input) {\n      ideas\n    }\n  }\n": types.GenerateSaasIdeasMutationDocument,
    "\n  mutation notificationMutation($input: UpdateNotificationMutationInput!) {\n    updateNotification(input: $input) {\n      hasUnreadNotifications\n      notificationEdge {\n        node {\n          id\n          readAt\n        }\n      }\n    }\n  }\n": types.NotificationMutationDocument,
    "\n  query notificationsListQuery($count: Int = 20, $cursor: String) {\n    ...notificationsListContentFragment\n    ...notificationsButtonContent\n  }\n": types.NotificationsListQueryDocument,
    "\n  subscription NotificationCreatedSubscription {\n    notificationCreated {\n      notification {\n        ...notificationsListItemFragment\n      }\n    }\n  }\n": types.NotificationCreatedSubscriptionDocument,
    "\n  fragment notificationsButtonContent on Query {\n    hasUnreadNotifications\n  }\n": types.NotificationsButtonContentFragmentDoc,
    "\n  fragment notificationsListContentFragment on Query {\n    hasUnreadNotifications\n    allNotifications(first: $count, after: $cursor) {\n      edges {\n        node {\n          id\n          ...notificationsListItemFragment\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n": types.NotificationsListContentFragmentFragmentDoc,
    "\n  fragment notificationsListItemFragment on NotificationType {\n    id\n    data\n    createdAt\n    readAt\n    type\n    issuer {\n      id\n      avatar\n      email\n    }\n  }\n": types.NotificationsListItemFragmentFragmentDoc,
    "\n  mutation notificationsListMarkAsReadMutation($input: MarkReadAllNotificationsMutationInput!) {\n    markReadAllNotifications(input: $input) {\n      ok\n    }\n  }\n": types.NotificationsListMarkAsReadMutationDocument,
    "\n  mutation deleteTenantMutation($input: DeleteTenantMutationInput!) {\n    deleteTenant(input: $input) {\n      deletedIds\n      clientMutationId\n    }\n  }\n": types.DeleteTenantMutationDocument,
    "\n  mutation updateTenantMembershipMutation($input: UpdateTenantMembershipMutationInput!) {\n    updateTenantMembership(input: $input) {\n      tenantMembership {\n        ...commonQueryMembershipFragment\n      }\n    }\n  }\n": types.UpdateTenantMembershipMutationDocument,
    "\n  mutation deleteTenantMembershipMutation($input: DeleteTenantMembershipMutationInput!) {\n    deleteTenantMembership(input: $input) {\n      deletedIds\n      clientMutationId\n    }\n  }\n": types.DeleteTenantMembershipMutationDocument,
    "\n  query tenantMembersListQuery($id: ID!) {\n    tenant(id: $id) {\n      userMemberships {\n        id\n        role\n        invitationAccepted\n        inviteeEmailAddress\n        userId\n        firstName\n        lastName\n        userEmail\n        avatar\n      }\n    }\n  }\n": types.TenantMembersListQueryDocument,
    "\n  fragment tenantFragment on TenantType {\n    id\n    name\n    slug\n    membership {\n      role\n      invitationAccepted\n    }\n  }\n": types.TenantFragmentFragmentDoc,
    "\n  query currentTenantQuery($id: ID!) {\n    tenant(id: $id) {\n      ...tenantFragment\n    }\n  }\n": types.CurrentTenantQueryDocument,
    "\n  mutation addTenantMutation($input: CreateTenantMutationInput!) {\n    createTenant(input: $input) {\n      tenantEdge {\n        node {\n          id\n          name\n        }\n      }\n    }\n  }\n": types.AddTenantMutationDocument,
    "\n  mutation acceptTenantInvitationMutation($input: AcceptTenantInvitationMutationInput!) {\n    acceptTenantInvitation(input: $input) {\n      ok\n    }\n  }\n": types.AcceptTenantInvitationMutationDocument,
    "\n  mutation declineTenantInvitationMutation($input: DeclineTenantInvitationMutationInput!) {\n    declineTenantInvitation(input: $input) {\n      ok\n    }\n  }\n": types.DeclineTenantInvitationMutationDocument,
    "\n  mutation updateTenantMutation($input: UpdateTenantMutationInput!) {\n    updateTenant(input: $input) {\n      tenant {\n        id\n        name\n      }\n    }\n  }\n": types.UpdateTenantMutationDocument,
    "\n  mutation createTenantInvitationMutation($input: CreateTenantInvitationMutationInput!) {\n    createTenantInvitation(input: $input) {\n      email\n      role\n    }\n  }\n": types.CreateTenantInvitationMutationDocument,
    "\n  mutation authConfirmUserEmailMutation($input: ConfirmEmailMutationInput!) {\n    confirm(input: $input) {\n      ok\n    }\n  }\n": types.AuthConfirmUserEmailMutationDocument,
    "\n  mutation authChangePasswordMutation($input: ChangePasswordMutationInput!) {\n    changePassword(input: $input) {\n      access\n      refresh\n    }\n  }\n": types.AuthChangePasswordMutationDocument,
    "\n  mutation authUpdateUserProfileMutation($input: UpdateCurrentUserMutationInput!) {\n    updateCurrentUser(input: $input) {\n      userProfile {\n        id\n        user {\n          ...commonQueryCurrentUserFragment\n        }\n      }\n    }\n  }\n": types.AuthUpdateUserProfileMutationDocument,
    "\n  mutation loginFormMutation($input: ObtainTokenMutationInput!) {\n    tokenAuth(input: $input) {\n      access\n      refresh\n      otpAuthToken\n    }\n  }\n": types.LoginFormMutationDocument,
    "\n  mutation authRequestPasswordResetConfirmMutation($input: PasswordResetConfirmationMutationInput!) {\n    passwordResetConfirm(input: $input) {\n      ok\n    }\n  }\n": types.AuthRequestPasswordResetConfirmMutationDocument,
    "\n  mutation authRequestPasswordResetMutation($input: PasswordResetMutationInput!) {\n    passwordReset(input: $input) {\n      ok\n    }\n  }\n": types.AuthRequestPasswordResetMutationDocument,
    "\n  mutation authSignupMutation($input: SingUpMutationInput!) {\n    signUp(input: $input) {\n      access\n      refresh\n    }\n  }\n": types.AuthSignupMutationDocument,
    "\n  mutation generateOtp($input: GenerateOTPMutationInput!) {\n    generateOtp(input: $input) {\n      base32\n      otpauthUrl\n    }\n  }\n": types.GenerateOtpDocument,
    "\n  mutation verifyOtp($input: VerifyOTPMutationInput!) {\n    verifyOtp(input: $input) {\n      otpVerified\n    }\n  }\n": types.VerifyOtpDocument,
    "\n  mutation validateOtp($input: ValidateOTPMutationInput!) {\n    validateOtp(input: $input) {\n      access\n      refresh\n    }\n  }\n": types.ValidateOtpDocument,
    "\n  mutation disableOtp($input: DisableOTPMutationInput!) {\n    disableOtp(input: $input) {\n      ok\n    }\n  }\n": types.DisableOtpDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query paginationListTestQuery($first: Int, $after: String, $last: Int, $before: String) {\n    allNotifications(first: $first, after: $after, last: $last, before: $before) {\n      edges {\n        node {\n          id\n        }\n      }\n      pageInfo {\n        startCursor\n        endCursor\n        hasPreviousPage\n        hasNextPage\n      }\n    }\n  }\n"): (typeof documents)["\n  query paginationListTestQuery($first: Int, $after: String, $last: Int, $before: String) {\n    allNotifications(first: $first, after: $after, last: $last, before: $before) {\n      edges {\n        node {\n          id\n        }\n      }\n      pageInfo {\n        startCursor\n        endCursor\n        hasPreviousPage\n        hasNextPage\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment commonQueryCurrentUserFragment on CurrentUserType {\n    id\n    email\n    firstName\n    lastName\n    roles\n    avatar\n    otpVerified\n    otpEnabled\n  }\n"): (typeof documents)["\n  fragment commonQueryCurrentUserFragment on CurrentUserType {\n    id\n    email\n    firstName\n    lastName\n    roles\n    avatar\n    otpVerified\n    otpEnabled\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment commonQueryTenantItemFragment on TenantType {\n    id\n    name\n    type\n    membership {\n      ...commonQueryMembershipFragment\n    }\n  }\n"): (typeof documents)["\n  fragment commonQueryTenantItemFragment on TenantType {\n    id\n    name\n    type\n    membership {\n      ...commonQueryMembershipFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment commonQueryMembershipFragment on TenantMembershipType {\n    id\n    role\n    invitationAccepted\n    inviteeEmailAddress\n    invitationToken\n    userId\n    firstName\n    lastName\n    userEmail\n    avatar\n  }\n"): (typeof documents)["\n  fragment commonQueryMembershipFragment on TenantMembershipType {\n    id\n    role\n    invitationAccepted\n    inviteeEmailAddress\n    invitationToken\n    userId\n    firstName\n    lastName\n    userEmail\n    avatar\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query commonQueryCurrentUserQuery {\n    currentUser {\n      ...commonQueryCurrentUserFragment\n      tenants {\n        ...commonQueryTenantItemFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  query commonQueryCurrentUserQuery {\n    currentUser {\n      ...commonQueryCurrentUserFragment\n      tenants {\n        ...commonQueryTenantItemFragment\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query configContentfulAppConfigQuery {\n    appConfigCollection(limit: 1) {\n      items {\n        name\n        privacyPolicy\n        termsAndConditions\n      }\n    }\n  }\n"): (typeof documents)["\n  query configContentfulAppConfigQuery {\n    appConfigCollection(limit: 1) {\n      items {\n        name\n        privacyPolicy\n        termsAndConditions\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation useFavoriteDemoItemListCreateMutation($input: CreateFavoriteContentfulDemoItemMutationInput!) {\n    createFavoriteContentfulDemoItem(input: $input) {\n      contentfulDemoItemFavoriteEdge {\n        node {\n          id\n          item {\n            pk\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation useFavoriteDemoItemListCreateMutation($input: CreateFavoriteContentfulDemoItemMutationInput!) {\n    createFavoriteContentfulDemoItem(input: $input) {\n      contentfulDemoItemFavoriteEdge {\n        node {\n          id\n          item {\n            pk\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment useFavoriteDemoItem_item on ContentfulDemoItemFavoriteType {\n    id\n    item {\n      pk\n    }\n  }\n"): (typeof documents)["\n  fragment useFavoriteDemoItem_item on ContentfulDemoItemFavoriteType {\n    id\n    item {\n      pk\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation useFavoriteDemoItemListDeleteMutation($input: DeleteFavoriteContentfulDemoItemMutationInput!) {\n    deleteFavoriteContentfulDemoItem(input: $input) {\n      deletedIds\n    }\n  }\n"): (typeof documents)["\n  mutation useFavoriteDemoItemListDeleteMutation($input: DeleteFavoriteContentfulDemoItemMutationInput!) {\n    deleteFavoriteContentfulDemoItem(input: $input) {\n      deletedIds\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query useFavoriteDemoItemListQuery {\n    allContentfulDemoItemFavorites(first: 100) {\n      edges {\n        node {\n          id\n          ...useFavoriteDemoItem_item\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query useFavoriteDemoItemListQuery {\n    allContentfulDemoItemFavorites(first: 100) {\n      edges {\n        node {\n          id\n          ...useFavoriteDemoItem_item\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query demoItemQuery($id: String!) {\n    demoItem(id: $id) {\n      title\n      description\n      image {\n        url\n        title\n        description\n      }\n    }\n  }\n"): (typeof documents)["\n  query demoItemQuery($id: String!) {\n    demoItem(id: $id) {\n      title\n      description\n      image {\n        url\n        title\n        description\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment demoItemListItemFragment on DemoItem {\n    title\n    image {\n      title\n      url\n    }\n  }\n"): (typeof documents)["\n  fragment demoItemListItemFragment on DemoItem {\n    title\n    image {\n      title\n      url\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query demoItemsAllQuery {\n    demoItemCollection {\n      items {\n        sys {\n          id\n        }\n        ...demoItemListItemFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  query demoItemsAllQuery {\n    demoItemCollection {\n      items {\n        sys {\n          id\n        }\n        ...demoItemListItemFragment\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation addCrudDemoItemMutation($input: CreateCrudDemoItemMutationInput!) {\n    createCrudDemoItem(input: $input) {\n      crudDemoItemEdge {\n        node {\n          id\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation addCrudDemoItemMutation($input: CreateCrudDemoItemMutationInput!) {\n    createCrudDemoItem(input: $input) {\n      crudDemoItemEdge {\n        node {\n          id\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query crudDemoItemDetailsQuery($id: ID!, $tenantId: ID!) {\n    crudDemoItem(id: $id, tenantId: $tenantId) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query crudDemoItemDetailsQuery($id: ID!, $tenantId: ID!) {\n    crudDemoItem(id: $id, tenantId: $tenantId) {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query crudDemoItemListQuery($tenantId: ID!, $first: Int, $after: String, $last: Int, $before: String) {\n    allCrudDemoItems(tenantId: $tenantId, first: $first, after: $after, last: $last, before: $before) {\n      edges {\n        node {\n          id\n          ...crudDemoItemListItem\n        }\n      }\n      pageInfo {\n        startCursor\n        endCursor\n        hasPreviousPage\n        hasNextPage\n      }\n    }\n  }\n"): (typeof documents)["\n  query crudDemoItemListQuery($tenantId: ID!, $first: Int, $after: String, $last: Int, $before: String) {\n    allCrudDemoItems(tenantId: $tenantId, first: $first, after: $after, last: $last, before: $before) {\n      edges {\n        node {\n          id\n          ...crudDemoItemListItem\n        }\n      }\n      pageInfo {\n        startCursor\n        endCursor\n        hasPreviousPage\n        hasNextPage\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query crudDemoItemListItemTestQuery {\n    item: crudDemoItem(id: \"test-id\") {\n      ...crudDemoItemListItem\n    }\n  }\n"): (typeof documents)["\n  query crudDemoItemListItemTestQuery {\n    item: crudDemoItem(id: \"test-id\") {\n      ...crudDemoItemListItem\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation crudDemoItemListItemDeleteMutation($input: DeleteCrudDemoItemMutationInput!) {\n    deleteCrudDemoItem(input: $input) {\n      deletedIds\n    }\n  }\n"): (typeof documents)["\n  mutation crudDemoItemListItemDeleteMutation($input: DeleteCrudDemoItemMutationInput!) {\n    deleteCrudDemoItem(input: $input) {\n      deletedIds\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment crudDemoItemListItem on CrudDemoItemType {\n    id\n    name\n  }\n"): (typeof documents)["\n  fragment crudDemoItemListItem on CrudDemoItemType {\n    id\n    name\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query crudDemoItemListItemDefaultStoryQuery {\n    item: crudDemoItem(id: \"test-id\") {\n      ...crudDemoItemListItem\n    }\n  }\n"): (typeof documents)["\n  query crudDemoItemListItemDefaultStoryQuery {\n    item: crudDemoItem(id: \"test-id\") {\n      ...crudDemoItemListItem\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query editCrudDemoItemQuery($id: ID!, $tenantId: ID!) {\n    crudDemoItem(id: $id, tenantId: $tenantId) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query editCrudDemoItemQuery($id: ID!, $tenantId: ID!) {\n    crudDemoItem(id: $id, tenantId: $tenantId) {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation editCrudDemoItemContentMutation($input: UpdateCrudDemoItemMutationInput!) {\n    updateCrudDemoItem(input: $input) {\n      crudDemoItem {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation editCrudDemoItemContentMutation($input: UpdateCrudDemoItemMutationInput!) {\n    updateCrudDemoItem(input: $input) {\n      crudDemoItem {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment documentListItem on DocumentDemoItemType {\n    id\n    file {\n      url\n      name\n    }\n    createdAt\n  }\n"): (typeof documents)["\n  fragment documentListItem on DocumentDemoItemType {\n    id\n    file {\n      url\n      name\n    }\n    createdAt\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query documentsListQuery {\n    allDocumentDemoItems(first: 10) {\n      edges {\n        node {\n          id\n          ...documentListItem\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query documentsListQuery {\n    allDocumentDemoItems(first: 10) {\n      edges {\n        node {\n          id\n          ...documentListItem\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation documentsListCreateMutation($input: CreateDocumentDemoItemMutationInput!) {\n    createDocumentDemoItem(input: $input) {\n      documentDemoItemEdge {\n        node {\n          id\n          ...documentListItem\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation documentsListCreateMutation($input: CreateDocumentDemoItemMutationInput!) {\n    createDocumentDemoItem(input: $input) {\n      documentDemoItemEdge {\n        node {\n          id\n          ...documentListItem\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation documentsDeleteMutation($input: DeleteDocumentDemoItemMutationInput!) {\n    deleteDocumentDemoItem(input: $input) {\n      deletedIds\n    }\n  }\n"): (typeof documents)["\n  mutation documentsDeleteMutation($input: DeleteDocumentDemoItemMutationInput!) {\n    deleteDocumentDemoItem(input: $input) {\n      deletedIds\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment stripePaymentIntentFragment on StripePaymentIntentType {\n    id\n    amount\n    clientSecret\n    currency\n    pk\n  }\n"): (typeof documents)["\n  fragment stripePaymentIntentFragment on StripePaymentIntentType {\n    id\n    amount\n    clientSecret\n    currency\n    pk\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation stripeCreatePaymentIntentMutation_($input: CreatePaymentIntentMutationInput!) {\n    createPaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n        id\n        amount\n        clientSecret\n        currency\n        pk\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation stripeCreatePaymentIntentMutation_($input: CreatePaymentIntentMutationInput!) {\n    createPaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n        id\n        amount\n        clientSecret\n        currency\n        pk\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation stripeUpdatePaymentIntentMutation_($input: UpdatePaymentIntentMutationInput!) {\n    updatePaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n        id\n        amount\n        clientSecret\n        currency\n        pk\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation stripeUpdatePaymentIntentMutation_($input: UpdatePaymentIntentMutationInput!) {\n    updatePaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n        id\n        amount\n        clientSecret\n        currency\n        pk\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment stripePaymentMethodFragment on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n"): (typeof documents)["\n  fragment stripePaymentMethodFragment on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query stripeSubscriptionQuery($tenantId: ID!) {\n    allPaymentMethods(tenantId: $tenantId, first: 100) {\n      edges {\n        node {\n          id\n          pk\n          type\n          card\n          billingDetails\n          ...stripePaymentMethodFragment\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n\n    activeSubscription(tenantId: $tenantId) {\n      ...subscriptionActiveSubscriptionFragment\n      id\n      __typename\n    }\n  }\n"): (typeof documents)["\n  query stripeSubscriptionQuery($tenantId: ID!) {\n    allPaymentMethods(tenantId: $tenantId, first: 100) {\n      edges {\n        node {\n          id\n          pk\n          type\n          card\n          billingDetails\n          ...stripePaymentMethodFragment\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n\n    activeSubscription(tenantId: $tenantId) {\n      ...subscriptionActiveSubscriptionFragment\n      id\n      __typename\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation stripeDeletePaymentMethodMutation($input: DeletePaymentMethodMutationInput!) {\n    deletePaymentMethod(input: $input) {\n      deletedIds\n      activeSubscription {\n        defaultPaymentMethod {\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation stripeDeletePaymentMethodMutation($input: DeletePaymentMethodMutationInput!) {\n    deletePaymentMethod(input: $input) {\n      deletedIds\n      activeSubscription {\n        defaultPaymentMethod {\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation stripeUpdateDefaultPaymentMethodMutation($input: UpdateDefaultPaymentMethodMutationInput!) {\n    updateDefaultPaymentMethod(input: $input) {\n      activeSubscription {\n        ...subscriptionActiveSubscriptionFragment\n        id\n      }\n      paymentMethodEdge {\n        node {\n          ...stripePaymentMethodFragment\n          id\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation stripeUpdateDefaultPaymentMethodMutation($input: UpdateDefaultPaymentMethodMutationInput!) {\n    updateDefaultPaymentMethod(input: $input) {\n      activeSubscription {\n        ...subscriptionActiveSubscriptionFragment\n        id\n      }\n      paymentMethodEdge {\n        node {\n          ...stripePaymentMethodFragment\n          id\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          pk\n          product {\n            id\n            name\n          }\n          unitAmount\n          id\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n      id\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment_\n      id\n    }\n  }\n\n  fragment subscriptionPlanItemFragment on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    amount\n  }\n"): (typeof documents)["\n  fragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          pk\n          product {\n            id\n            name\n          }\n          unitAmount\n          id\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n      id\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment_\n      id\n    }\n  }\n\n  fragment subscriptionPlanItemFragment on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    amount\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment subscriptionActiveSubscriptionDetailsFragment on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          ...subscriptionPriceItemFragment\n          id\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n      id\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment_\n      id\n    }\n  }\n\n  fragment stripePaymentMethodFragment_ on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n"): (typeof documents)["\n  fragment subscriptionActiveSubscriptionDetailsFragment on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          ...subscriptionPriceItemFragment\n          id\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n      id\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment_\n      id\n    }\n  }\n\n  fragment stripePaymentMethodFragment_ on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query subscriptionActivePlanDetailsQuery_($tenantId: ID!) {\n    activeSubscription(tenantId: $tenantId) {\n      ...subscriptionActiveSubscriptionFragment\n      id\n    }\n  }\n"): (typeof documents)["\n  query subscriptionActivePlanDetailsQuery_($tenantId: ID!) {\n    activeSubscription(tenantId: $tenantId) {\n      ...subscriptionActiveSubscriptionFragment\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation subscriptionCancelActiveSubscriptionMutation($input: CancelActiveSubscriptionMutationInput!) {\n    cancelActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation subscriptionCancelActiveSubscriptionMutation($input: CancelActiveSubscriptionMutationInput!) {\n    cancelActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation stripeCreateSetupIntentMutation_($input: CreateSetupIntentMutationInput!) {\n    createSetupIntent(input: $input) {\n      setupIntent {\n        id\n        ...stripeSetupIntentFragment\n      }\n    }\n  }\n\n  fragment stripeSetupIntentFragment on StripeSetupIntentType {\n    id\n    clientSecret\n  }\n"): (typeof documents)["\n  mutation stripeCreateSetupIntentMutation_($input: CreateSetupIntentMutationInput!) {\n    createSetupIntent(input: $input) {\n      setupIntent {\n        id\n        ...stripeSetupIntentFragment\n      }\n    }\n  }\n\n  fragment stripeSetupIntentFragment on StripeSetupIntentType {\n    id\n    clientSecret\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation subscriptionChangeActiveSubscriptionMutation($input: ChangeActiveSubscriptionMutationInput!) {\n    changeActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation subscriptionChangeActiveSubscriptionMutation($input: ChangeActiveSubscriptionMutationInput!) {\n    changeActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query subscriptionPlansAllQuery {\n    allSubscriptionPlans(first: 100) {\n      edges {\n        node {\n          ...subscriptionPriceItemFragment\n          id\n          pk\n          product {\n            id\n            name\n          }\n          unitAmount\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query subscriptionPlansAllQuery {\n    allSubscriptionPlans(first: 100) {\n      edges {\n        node {\n          ...subscriptionPriceItemFragment\n          id\n          pk\n          product {\n            id\n            name\n          }\n          unitAmount\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment subscriptionPriceItemFragment on StripePriceType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    unitAmount\n  }\n"): (typeof documents)["\n  fragment subscriptionPriceItemFragment on StripePriceType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    unitAmount\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query stripeAllChargesQuery($tenantId: ID!) {\n    allCharges(tenantId: $tenantId) {\n      edges {\n        node {\n          id\n          ...stripeChargeFragment\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query stripeAllChargesQuery($tenantId: ID!) {\n    allCharges(tenantId: $tenantId) {\n      edges {\n        node {\n          id\n          ...stripeChargeFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment stripeChargeFragment on StripeChargeType {\n    id\n    created\n    billingDetails\n    paymentMethod {\n      ...stripePaymentMethodFragment\n      id\n    }\n    amount\n    invoice {\n      id\n      subscription {\n        plan {\n          ...subscriptionPlanItemFragment\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment stripeChargeFragment on StripeChargeType {\n    id\n    created\n    billingDetails\n    paymentMethod {\n      ...stripePaymentMethodFragment\n      id\n    }\n    amount\n    invoice {\n      id\n      subscription {\n        plan {\n          ...subscriptionPlanItemFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment subscriptionPlanItemFragment on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    amount\n  }\n"): (typeof documents)["\n  fragment subscriptionPlanItemFragment on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    amount\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation generateSaasIdeasMutation($input: GenerateSaasIdeasMutationInput!) {\n    generateSaasIdeas(input: $input) {\n      ideas\n    }\n  }\n"): (typeof documents)["\n  mutation generateSaasIdeasMutation($input: GenerateSaasIdeasMutationInput!) {\n    generateSaasIdeas(input: $input) {\n      ideas\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation notificationMutation($input: UpdateNotificationMutationInput!) {\n    updateNotification(input: $input) {\n      hasUnreadNotifications\n      notificationEdge {\n        node {\n          id\n          readAt\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation notificationMutation($input: UpdateNotificationMutationInput!) {\n    updateNotification(input: $input) {\n      hasUnreadNotifications\n      notificationEdge {\n        node {\n          id\n          readAt\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query notificationsListQuery($count: Int = 20, $cursor: String) {\n    ...notificationsListContentFragment\n    ...notificationsButtonContent\n  }\n"): (typeof documents)["\n  query notificationsListQuery($count: Int = 20, $cursor: String) {\n    ...notificationsListContentFragment\n    ...notificationsButtonContent\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription NotificationCreatedSubscription {\n    notificationCreated {\n      notification {\n        ...notificationsListItemFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription NotificationCreatedSubscription {\n    notificationCreated {\n      notification {\n        ...notificationsListItemFragment\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment notificationsButtonContent on Query {\n    hasUnreadNotifications\n  }\n"): (typeof documents)["\n  fragment notificationsButtonContent on Query {\n    hasUnreadNotifications\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment notificationsListContentFragment on Query {\n    hasUnreadNotifications\n    allNotifications(first: $count, after: $cursor) {\n      edges {\n        node {\n          id\n          ...notificationsListItemFragment\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment notificationsListContentFragment on Query {\n    hasUnreadNotifications\n    allNotifications(first: $count, after: $cursor) {\n      edges {\n        node {\n          id\n          ...notificationsListItemFragment\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment notificationsListItemFragment on NotificationType {\n    id\n    data\n    createdAt\n    readAt\n    type\n    issuer {\n      id\n      avatar\n      email\n    }\n  }\n"): (typeof documents)["\n  fragment notificationsListItemFragment on NotificationType {\n    id\n    data\n    createdAt\n    readAt\n    type\n    issuer {\n      id\n      avatar\n      email\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation notificationsListMarkAsReadMutation($input: MarkReadAllNotificationsMutationInput!) {\n    markReadAllNotifications(input: $input) {\n      ok\n    }\n  }\n"): (typeof documents)["\n  mutation notificationsListMarkAsReadMutation($input: MarkReadAllNotificationsMutationInput!) {\n    markReadAllNotifications(input: $input) {\n      ok\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation deleteTenantMutation($input: DeleteTenantMutationInput!) {\n    deleteTenant(input: $input) {\n      deletedIds\n      clientMutationId\n    }\n  }\n"): (typeof documents)["\n  mutation deleteTenantMutation($input: DeleteTenantMutationInput!) {\n    deleteTenant(input: $input) {\n      deletedIds\n      clientMutationId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation updateTenantMembershipMutation($input: UpdateTenantMembershipMutationInput!) {\n    updateTenantMembership(input: $input) {\n      tenantMembership {\n        ...commonQueryMembershipFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation updateTenantMembershipMutation($input: UpdateTenantMembershipMutationInput!) {\n    updateTenantMembership(input: $input) {\n      tenantMembership {\n        ...commonQueryMembershipFragment\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation deleteTenantMembershipMutation($input: DeleteTenantMembershipMutationInput!) {\n    deleteTenantMembership(input: $input) {\n      deletedIds\n      clientMutationId\n    }\n  }\n"): (typeof documents)["\n  mutation deleteTenantMembershipMutation($input: DeleteTenantMembershipMutationInput!) {\n    deleteTenantMembership(input: $input) {\n      deletedIds\n      clientMutationId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query tenantMembersListQuery($id: ID!) {\n    tenant(id: $id) {\n      userMemberships {\n        id\n        role\n        invitationAccepted\n        inviteeEmailAddress\n        userId\n        firstName\n        lastName\n        userEmail\n        avatar\n      }\n    }\n  }\n"): (typeof documents)["\n  query tenantMembersListQuery($id: ID!) {\n    tenant(id: $id) {\n      userMemberships {\n        id\n        role\n        invitationAccepted\n        inviteeEmailAddress\n        userId\n        firstName\n        lastName\n        userEmail\n        avatar\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment tenantFragment on TenantType {\n    id\n    name\n    slug\n    membership {\n      role\n      invitationAccepted\n    }\n  }\n"): (typeof documents)["\n  fragment tenantFragment on TenantType {\n    id\n    name\n    slug\n    membership {\n      role\n      invitationAccepted\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query currentTenantQuery($id: ID!) {\n    tenant(id: $id) {\n      ...tenantFragment\n    }\n  }\n"): (typeof documents)["\n  query currentTenantQuery($id: ID!) {\n    tenant(id: $id) {\n      ...tenantFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation addTenantMutation($input: CreateTenantMutationInput!) {\n    createTenant(input: $input) {\n      tenantEdge {\n        node {\n          id\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation addTenantMutation($input: CreateTenantMutationInput!) {\n    createTenant(input: $input) {\n      tenantEdge {\n        node {\n          id\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation acceptTenantInvitationMutation($input: AcceptTenantInvitationMutationInput!) {\n    acceptTenantInvitation(input: $input) {\n      ok\n    }\n  }\n"): (typeof documents)["\n  mutation acceptTenantInvitationMutation($input: AcceptTenantInvitationMutationInput!) {\n    acceptTenantInvitation(input: $input) {\n      ok\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation declineTenantInvitationMutation($input: DeclineTenantInvitationMutationInput!) {\n    declineTenantInvitation(input: $input) {\n      ok\n    }\n  }\n"): (typeof documents)["\n  mutation declineTenantInvitationMutation($input: DeclineTenantInvitationMutationInput!) {\n    declineTenantInvitation(input: $input) {\n      ok\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation updateTenantMutation($input: UpdateTenantMutationInput!) {\n    updateTenant(input: $input) {\n      tenant {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation updateTenantMutation($input: UpdateTenantMutationInput!) {\n    updateTenant(input: $input) {\n      tenant {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation createTenantInvitationMutation($input: CreateTenantInvitationMutationInput!) {\n    createTenantInvitation(input: $input) {\n      email\n      role\n    }\n  }\n"): (typeof documents)["\n  mutation createTenantInvitationMutation($input: CreateTenantInvitationMutationInput!) {\n    createTenantInvitation(input: $input) {\n      email\n      role\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authConfirmUserEmailMutation($input: ConfirmEmailMutationInput!) {\n    confirm(input: $input) {\n      ok\n    }\n  }\n"): (typeof documents)["\n  mutation authConfirmUserEmailMutation($input: ConfirmEmailMutationInput!) {\n    confirm(input: $input) {\n      ok\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authChangePasswordMutation($input: ChangePasswordMutationInput!) {\n    changePassword(input: $input) {\n      access\n      refresh\n    }\n  }\n"): (typeof documents)["\n  mutation authChangePasswordMutation($input: ChangePasswordMutationInput!) {\n    changePassword(input: $input) {\n      access\n      refresh\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authUpdateUserProfileMutation($input: UpdateCurrentUserMutationInput!) {\n    updateCurrentUser(input: $input) {\n      userProfile {\n        id\n        user {\n          ...commonQueryCurrentUserFragment\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation authUpdateUserProfileMutation($input: UpdateCurrentUserMutationInput!) {\n    updateCurrentUser(input: $input) {\n      userProfile {\n        id\n        user {\n          ...commonQueryCurrentUserFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation loginFormMutation($input: ObtainTokenMutationInput!) {\n    tokenAuth(input: $input) {\n      access\n      refresh\n      otpAuthToken\n    }\n  }\n"): (typeof documents)["\n  mutation loginFormMutation($input: ObtainTokenMutationInput!) {\n    tokenAuth(input: $input) {\n      access\n      refresh\n      otpAuthToken\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authRequestPasswordResetConfirmMutation($input: PasswordResetConfirmationMutationInput!) {\n    passwordResetConfirm(input: $input) {\n      ok\n    }\n  }\n"): (typeof documents)["\n  mutation authRequestPasswordResetConfirmMutation($input: PasswordResetConfirmationMutationInput!) {\n    passwordResetConfirm(input: $input) {\n      ok\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authRequestPasswordResetMutation($input: PasswordResetMutationInput!) {\n    passwordReset(input: $input) {\n      ok\n    }\n  }\n"): (typeof documents)["\n  mutation authRequestPasswordResetMutation($input: PasswordResetMutationInput!) {\n    passwordReset(input: $input) {\n      ok\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authSignupMutation($input: SingUpMutationInput!) {\n    signUp(input: $input) {\n      access\n      refresh\n    }\n  }\n"): (typeof documents)["\n  mutation authSignupMutation($input: SingUpMutationInput!) {\n    signUp(input: $input) {\n      access\n      refresh\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation generateOtp($input: GenerateOTPMutationInput!) {\n    generateOtp(input: $input) {\n      base32\n      otpauthUrl\n    }\n  }\n"): (typeof documents)["\n  mutation generateOtp($input: GenerateOTPMutationInput!) {\n    generateOtp(input: $input) {\n      base32\n      otpauthUrl\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation verifyOtp($input: VerifyOTPMutationInput!) {\n    verifyOtp(input: $input) {\n      otpVerified\n    }\n  }\n"): (typeof documents)["\n  mutation verifyOtp($input: VerifyOTPMutationInput!) {\n    verifyOtp(input: $input) {\n      otpVerified\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation validateOtp($input: ValidateOTPMutationInput!) {\n    validateOtp(input: $input) {\n      access\n      refresh\n    }\n  }\n"): (typeof documents)["\n  mutation validateOtp($input: ValidateOTPMutationInput!) {\n    validateOtp(input: $input) {\n      access\n      refresh\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation disableOtp($input: DisableOTPMutationInput!) {\n    disableOtp(input: $input) {\n      ok\n    }\n  }\n"): (typeof documents)["\n  mutation disableOtp($input: DisableOTPMutationInput!) {\n    disableOtp(input: $input) {\n      ok\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;