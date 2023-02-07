/* eslint-disable */
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
 * Therefore it is highly recommended to use the babel-plugin for production.
 */
const documents = {
    "\n  fragment commonQueryCurrentUserFragment on CurrentUserType {\n    id\n    email\n    firstName\n    lastName\n    roles\n    avatar\n  }\n": types.CommonQueryCurrentUserFragmentFragmentDoc,
    "\n  query commonQueryCurrentUserQuery {\n    currentUser {\n      ...commonQueryCurrentUserFragment\n    }\n  }\n": types.CommonQueryCurrentUserQueryDocument,
    "\n  mutation authUpdateUserProfileMutation($input: UpdateCurrentUserMutationInput!) {\n    updateCurrentUser(input: $input) {\n      userProfile {\n        id\n        user {\n          ...commonQueryCurrentUserFragment\n        }\n      }\n    }\n  }\n": types.AuthUpdateUserProfileMutationDocument,
    "\n  mutation authChangePasswordMutation($input: ChangePasswordMutationInput!) {\n    changePassword(input: $input) {\n      access\n      refresh\n    }\n  }\n": types.AuthChangePasswordMutationDocument,
    "\n  mutation authConfirmUserEmailMutation($input: ConfirmEmailMutationInput!) {\n    confirm(input: $input) {\n      ok\n    }\n  }\n": types.AuthConfirmUserEmailMutationDocument,
    "\n  mutation authRequestPasswordResetMutation($input: PasswordResetMutationInput!) {\n    passwordReset(input: $input) {\n      ok\n    }\n  }\n": types.AuthRequestPasswordResetMutationDocument,
    "\n  mutation authRequestPasswordResetConfirmMutation($input: PasswordResetConfirmationMutationInput!) {\n    passwordResetConfirm(input: $input) {\n      ok\n    }\n  }\n": types.AuthRequestPasswordResetConfirmMutationDocument,
    "\n  query configContentfulAppConfigQuery {\n    appConfigCollection(limit: 1) {\n      items {\n        name\n        privacyPolicy\n        termsAndConditions\n      }\n    }\n  }\n": types.ConfigContentfulAppConfigQueryDocument,
    "\n  mutation stripeDeletePaymentMethodMutation($input: DeletePaymentMethodMutationInput!, $connections: [ID!]!) {\n    deletePaymentMethod(input: $input) {\n      deletedIds @deleteEdge(connections: $connections)\n      activeSubscription {\n        defaultPaymentMethod {\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n": types.StripeDeletePaymentMethodMutationDocument,
    "\n  mutation stripeUpdateDefaultPaymentMethodMutation(\n    $input: UpdateDefaultPaymentMethodMutationInput!\n    $connections: [ID!]!\n  ) {\n    updateDefaultPaymentMethod(input: $input) {\n      activeSubscription {\n        ...subscriptionActiveSubscriptionFragment\n      }\n      paymentMethodEdge @appendEdge(connections: $connections) {\n        node {\n          # commented only because of the broken apollo types: need to fix it after migration\n          #          ...stripePaymentMethodFragment @relay(mask: false)\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n": types.StripeUpdateDefaultPaymentMethodMutationDocument,
    "\n  mutation stripeCreatePaymentIntentMutation($input: CreatePaymentIntentMutationInput!) {\n    createPaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n      }\n    }\n  }\n": types.StripeCreatePaymentIntentMutationDocument,
    "\n  mutation stripeUpdatePaymentIntentMutation($input: UpdatePaymentIntentMutationInput!) {\n    updatePaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n      }\n    }\n  }\n": types.StripeUpdatePaymentIntentMutationDocument,
    "\n  mutation stripeCreateSetupIntentMutation($input: CreateSetupIntentMutationInput!) {\n    createSetupIntent(input: $input) {\n      setupIntent {\n        ...stripeSetupIntentFragment\n      }\n    }\n  }\n": types.StripeCreateSetupIntentMutationDocument,
    "\n  fragment stripePaymentMethodFragment on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n": types.StripePaymentMethodFragmentFragmentDoc,
    "\n  query stripeAllPaymentMethodsQuery {\n    allPaymentMethods(first: 100) @connection(key: \"stripe_allPaymentMethods\") {\n      edges {\n        node {\n          # commented only because of the broken apollo types: need to fix it after migration\n          #          ...stripePaymentMethodFragment @relay(mask: false)\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n": types.StripeAllPaymentMethodsQueryDocument,
    "\n  fragment stripeChargeFragment on StripeChargeType {\n    id\n    created\n    billingDetails\n    paymentMethod {\n      ...stripePaymentMethodFragment\n    }\n    amount\n    invoice {\n      id\n      subscription {\n        plan {\n          ...subscriptionPlanItemFragment\n        }\n      }\n    }\n  }\n": types.StripeChargeFragmentFragmentDoc,
    "\n  query stripeAllChargesQuery {\n    allCharges {\n      edges {\n        node {\n          id\n          ...stripeChargeFragment\n        }\n      }\n    }\n  }\n": types.StripeAllChargesQueryDocument,
    "\n  fragment stripePaymentIntentFragment on StripePaymentIntentType @inline {\n    id\n    amount\n    clientSecret\n    currency\n    pk\n  }\n": types.StripePaymentIntentFragmentFragmentDoc,
    "\n  query stripePaymentIntentQuery($id: ID!) {\n    paymentIntent(id: $id) {\n      ...stripePaymentIntentFragment\n    }\n  }\n": types.StripePaymentIntentQueryDocument,
    "\n  fragment stripeSetupIntentFragment on StripeSetupIntentType @inline {\n    id\n    clientSecret\n  }\n": types.StripeSetupIntentFragmentFragmentDoc,
    "\n  mutation subscriptionChangeActiveSubscriptionMutation($input: ChangeActiveSubscriptionMutationInput!) {\n    changeActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n      }\n    }\n  }\n": types.SubscriptionChangeActiveSubscriptionMutationDocument,
    "\n  mutation subscriptionCancelActiveSubscriptionMutation($input: CancelActiveSubscriptionMutationInput!) {\n    cancelActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n      }\n    }\n  }\n": types.SubscriptionCancelActiveSubscriptionMutationDocument,
    "\n  fragment subscriptionPlanItemFragment on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    unitAmount\n  }\n": types.SubscriptionPlanItemFragmentFragmentDoc,
    "\n  fragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          ...subscriptionPlanItemFragment\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment\n    }\n  }\n": types.SubscriptionActiveSubscriptionFragmentFragmentDoc,
    "\n  query subscriptionPlansAllQuery {\n    allSubscriptionPlans(first: 100) {\n      edges {\n        node {\n          id\n          ...subscriptionPlanItemFragment\n        }\n      }\n    }\n  }\n": types.SubscriptionPlansAllQueryDocument,
    "\n  query subscriptionActivePlanDetailsQuery {\n    activeSubscription {\n      ...subscriptionActiveSubscriptionFragment\n    }\n  }\n": types.SubscriptionActivePlanDetailsQueryDocument,
    "\n  mutation addCrudDemoItemMutation($input: CreateCrudDemoItemMutationInput!) {\n    createCrudDemoItem(input: $input) {\n      crudDemoItemEdge {\n        node {\n          id\n          name\n        }\n      }\n    }\n  }\n": types.AddCrudDemoItemMutationDocument,
    "\n  query crudDemoItemDetailsQuery($id: ID!) {\n    crudDemoItem(id: $id) {\n      id\n      name\n    }\n  }\n": types.CrudDemoItemDetailsQueryDocument,
    "\n  query crudDemoItemListQuery {\n    allCrudDemoItems(first: 100) {\n      edges {\n        node {\n          id\n          ...crudDemoItemListItem\n        }\n      }\n    }\n  }\n": types.CrudDemoItemListQueryDocument,
    "\n  query crudDemoItemListItemTestQuery {\n    item: crudDemoItem(id: \"test-id\") {\n      ...crudDemoItemListItem\n    }\n  }\n": types.CrudDemoItemListItemTestQueryDocument,
    "\n  mutation crudDemoItemListItemDeleteMutation($input: DeleteCrudDemoItemMutationInput!) {\n    deleteCrudDemoItem(input: $input) {\n      deletedIds\n    }\n  }\n": types.CrudDemoItemListItemDeleteMutationDocument,
    "\n  fragment crudDemoItemListItem on CrudDemoItemType {\n    id\n    name\n  }\n": types.CrudDemoItemListItemFragmentDoc,
    "\n  query crudDemoItemListItemDefaultStoryQuery {\n    item: crudDemoItem(id: \"test-id\") {\n      ...crudDemoItemListItem\n    }\n  }\n": types.CrudDemoItemListItemDefaultStoryQueryDocument,
    "\n  query editCrudDemoItemQuery($id: ID!) {\n    crudDemoItem(id: $id) {\n      id\n      name\n    }\n  }\n": types.EditCrudDemoItemQueryDocument,
    "\n  mutation editCrudDemoItemContentMutation($input: UpdateCrudDemoItemMutationInput!) {\n    updateCrudDemoItem(input: $input) {\n      crudDemoItem {\n        id\n        name\n      }\n    }\n  }\n": types.EditCrudDemoItemContentMutationDocument,
    "\n  query demoItemQuery($id: String!) {\n    demoItem(id: $id) {\n      title\n      description\n      image {\n        url\n        title\n        description\n      }\n    }\n  }\n": types.DemoItemQueryDocument,
    "\n        query demoItemListItemTestQuery @relay_test_operation {\n          testItem: demoItem(id: \"contentful-item-1\") {\n            ...demoItemListItem_item\n          }\n        }\n      ": types.DemoItemListItemTestQueryDocument,
    "\n  fragment demoItemListItem_item on DemoItem {\n    title\n    image {\n      title\n      url\n    }\n  }\n": types.DemoItemListItem_ItemFragmentDoc,
    "\n  query demoItemsAllQuery {\n    demoItemCollection {\n      items {\n        sys {\n          id\n        }\n        ...demoItemListItem_item\n      }\n    }\n  }\n": types.DemoItemsAllQueryDocument,
    "\n      query documentListItemStoryQuery @relay_test_operation {\n        allDocumentDemoItems(first: 1) {\n          edges {\n            node {\n              ...documentListItem\n            }\n          }\n        }\n      }\n    ": types.DocumentListItemStoryQueryDocument,
    "\n  fragment documentListItem on DocumentDemoItemType {\n    id\n    file {\n      url\n      name\n    }\n    createdAt\n  }\n": types.DocumentListItemFragmentDoc,
    "\n  query documentsListQuery {\n    allDocumentDemoItems(first: 10) {\n      edges {\n        node {\n          id\n          createdAt\n          ...documentListItem\n        }\n      }\n    }\n  }\n": types.DocumentsListQueryDocument,
    "\n      mutation documentsListCreateMutation($input: CreateDocumentDemoItemMutationInput!, $connections: [ID!]!) {\n        createDocumentDemoItem(input: $input) {\n          documentDemoItemEdge @appendEdge(connections: $connections) {\n            node {\n              createdAt\n              file {\n                name\n                url\n              }\n            }\n          }\n        }\n      }\n    ": types.DocumentsListCreateMutationDocument,
    "\n    mutation documentsDeleteMutation($input: DeleteDocumentDemoItemMutationInput!, $connections: [ID!]!) {\n      deleteDocumentDemoItem(input: $input) {\n        deletedIds @deleteEdge(connections: $connections)\n      }\n    }\n  ": types.DocumentsDeleteMutationDocument,
    "\n  mutation loginFormMutation($input: ObtainTokenMutationInput!) {\n    tokenAuth(input: $input) {\n      access\n      refresh\n    }\n  }\n": types.LoginFormMutationDocument,
    "\n  mutation authSignupMutation($input: SingUpMutationInput!) {\n    signUp(input: $input) {\n      access\n      refresh\n    }\n  }\n": types.AuthSignupMutationDocument,
    "\n  query stripeAllPaymentsMethodsQuery {\n    allPaymentMethods(first: 100) {\n      edges {\n        node {\n          id\n          pk\n          type\n          card\n          billingDetails\n          ...stripePaymentMethodFragment\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n": types.StripeAllPaymentsMethodsQueryDocument,
    "\n  mutation notificationMutation($input: UpdateNotificationMutationInput!) {\n    updateNotification(input: $input) {\n      hasUnreadNotifications\n      notificationEdge {\n        node {\n          id\n          readAt\n        }\n      }\n    }\n  }\n": types.NotificationMutationDocument,
    "\n  query notificationsListQuery($count: Int = 20, $cursor: String) {\n    ...notificationsListContentFragment\n    ...notificationsButtonContent\n  }\n": types.NotificationsListQueryDocument,
    "\n  subscription notificationsListSubscription {\n    notificationCreated {\n      edges {\n        node {\n          id\n          type\n          createdAt\n          readAt\n          data\n        }\n      }\n    }\n  }\n": types.NotificationsListSubscriptionDocument,
    "\n  fragment notificationsButtonContent on Query {\n    hasUnreadNotifications\n  }\n": types.NotificationsButtonContentFragmentDoc,
    "\n  fragment notificationsListContentFragment on Query {\n    hasUnreadNotifications\n    allNotifications(first: $count, after: $cursor) {\n      edges {\n        node {\n          id\n          data\n          createdAt\n          readAt\n          type\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n": types.NotificationsListContentFragmentFragmentDoc,
    "\n  mutation notificationsListMarkAsReadMutation($input: MarkReadAllNotificationsMutationInput!) {\n    markReadAllNotifications(input: $input) {\n      ok\n    }\n  }\n": types.NotificationsListMarkAsReadMutationDocument,
    "\n  fragment subscriptionActiveSubscriptionFragment_ on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          ...subscriptionPlanItemFragment_\n          id\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n      id\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment_\n      id\n    }\n  }\n\n  fragment subscriptionPlanItemFragment_ on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    unitAmount\n  }\n\n  fragment stripePaymentMethodFragment_ on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n": types.SubscriptionActiveSubscriptionFragment_FragmentDoc,
    "\n  query subscriptionActivePlanDetailsQuery_ {\n    activeSubscription {\n      ...subscriptionActiveSubscriptionFragment_\n      id\n    }\n  }\n": types.SubscriptionActivePlanDetailsQuery_Document,
    "\n      mutation useFavoriteDemoItemListCreateMutation(\n        $input: CreateFavoriteContentfulDemoItemMutationInput!\n        $connections: [ID!]!\n      ) {\n        createFavoriteContentfulDemoItem(input: $input) {\n          contentfulDemoItemFavoriteEdge @appendEdge(connections: $connections) {\n            node {\n              ...useFavoriteDemoItem_item @relay(mask: false)\n            }\n          }\n        }\n      }\n    ": types.UseFavoriteDemoItemListCreateMutationDocument,
    "\n      mutation useFavoriteDemoItemListDeleteMutation(\n        $input: DeleteFavoriteContentfulDemoItemMutationInput!\n        $connections: [ID!]!\n      ) {\n        deleteFavoriteContentfulDemoItem(input: $input) {\n          deletedIds @deleteEdge(connections: $connections)\n        }\n      }\n    ": types.UseFavoriteDemoItemListDeleteMutationDocument,
    "\n  fragment useFavoriteDemoItem_item on ContentfulDemoItemFavoriteType {\n    item {\n      pk\n    }\n  }\n": types.UseFavoriteDemoItem_ItemFragmentDoc,
    "\n      query useFavoriteDemoItemListQuery {\n        allContentfulDemoItemFavorites(first: 100)\n          @connection(key: \"useFavoriteDemoItemListQuery__allContentfulDemoItemFavorites\") {\n          edges {\n            node {\n              ...useFavoriteDemoItem_item @relay(mask: false)\n            }\n          }\n        }\n      }\n    ": types.UseFavoriteDemoItemListQueryDocument,
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
export function gql(source: "\n  fragment commonQueryCurrentUserFragment on CurrentUserType {\n    id\n    email\n    firstName\n    lastName\n    roles\n    avatar\n  }\n"): (typeof documents)["\n  fragment commonQueryCurrentUserFragment on CurrentUserType {\n    id\n    email\n    firstName\n    lastName\n    roles\n    avatar\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query commonQueryCurrentUserQuery {\n    currentUser {\n      ...commonQueryCurrentUserFragment\n    }\n  }\n"): (typeof documents)["\n  query commonQueryCurrentUserQuery {\n    currentUser {\n      ...commonQueryCurrentUserFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authUpdateUserProfileMutation($input: UpdateCurrentUserMutationInput!) {\n    updateCurrentUser(input: $input) {\n      userProfile {\n        id\n        user {\n          ...commonQueryCurrentUserFragment\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation authUpdateUserProfileMutation($input: UpdateCurrentUserMutationInput!) {\n    updateCurrentUser(input: $input) {\n      userProfile {\n        id\n        user {\n          ...commonQueryCurrentUserFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authChangePasswordMutation($input: ChangePasswordMutationInput!) {\n    changePassword(input: $input) {\n      access\n      refresh\n    }\n  }\n"): (typeof documents)["\n  mutation authChangePasswordMutation($input: ChangePasswordMutationInput!) {\n    changePassword(input: $input) {\n      access\n      refresh\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authConfirmUserEmailMutation($input: ConfirmEmailMutationInput!) {\n    confirm(input: $input) {\n      ok\n    }\n  }\n"): (typeof documents)["\n  mutation authConfirmUserEmailMutation($input: ConfirmEmailMutationInput!) {\n    confirm(input: $input) {\n      ok\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authRequestPasswordResetMutation($input: PasswordResetMutationInput!) {\n    passwordReset(input: $input) {\n      ok\n    }\n  }\n"): (typeof documents)["\n  mutation authRequestPasswordResetMutation($input: PasswordResetMutationInput!) {\n    passwordReset(input: $input) {\n      ok\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authRequestPasswordResetConfirmMutation($input: PasswordResetConfirmationMutationInput!) {\n    passwordResetConfirm(input: $input) {\n      ok\n    }\n  }\n"): (typeof documents)["\n  mutation authRequestPasswordResetConfirmMutation($input: PasswordResetConfirmationMutationInput!) {\n    passwordResetConfirm(input: $input) {\n      ok\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query configContentfulAppConfigQuery {\n    appConfigCollection(limit: 1) {\n      items {\n        name\n        privacyPolicy\n        termsAndConditions\n      }\n    }\n  }\n"): (typeof documents)["\n  query configContentfulAppConfigQuery {\n    appConfigCollection(limit: 1) {\n      items {\n        name\n        privacyPolicy\n        termsAndConditions\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation stripeDeletePaymentMethodMutation($input: DeletePaymentMethodMutationInput!, $connections: [ID!]!) {\n    deletePaymentMethod(input: $input) {\n      deletedIds @deleteEdge(connections: $connections)\n      activeSubscription {\n        defaultPaymentMethod {\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation stripeDeletePaymentMethodMutation($input: DeletePaymentMethodMutationInput!, $connections: [ID!]!) {\n    deletePaymentMethod(input: $input) {\n      deletedIds @deleteEdge(connections: $connections)\n      activeSubscription {\n        defaultPaymentMethod {\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation stripeUpdateDefaultPaymentMethodMutation(\n    $input: UpdateDefaultPaymentMethodMutationInput!\n    $connections: [ID!]!\n  ) {\n    updateDefaultPaymentMethod(input: $input) {\n      activeSubscription {\n        ...subscriptionActiveSubscriptionFragment\n      }\n      paymentMethodEdge @appendEdge(connections: $connections) {\n        node {\n          # commented only because of the broken apollo types: need to fix it after migration\n          #          ...stripePaymentMethodFragment @relay(mask: false)\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation stripeUpdateDefaultPaymentMethodMutation(\n    $input: UpdateDefaultPaymentMethodMutationInput!\n    $connections: [ID!]!\n  ) {\n    updateDefaultPaymentMethod(input: $input) {\n      activeSubscription {\n        ...subscriptionActiveSubscriptionFragment\n      }\n      paymentMethodEdge @appendEdge(connections: $connections) {\n        node {\n          # commented only because of the broken apollo types: need to fix it after migration\n          #          ...stripePaymentMethodFragment @relay(mask: false)\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation stripeCreatePaymentIntentMutation($input: CreatePaymentIntentMutationInput!) {\n    createPaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation stripeCreatePaymentIntentMutation($input: CreatePaymentIntentMutationInput!) {\n    createPaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation stripeUpdatePaymentIntentMutation($input: UpdatePaymentIntentMutationInput!) {\n    updatePaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation stripeUpdatePaymentIntentMutation($input: UpdatePaymentIntentMutationInput!) {\n    updatePaymentIntent(input: $input) {\n      paymentIntent {\n        ...stripePaymentIntentFragment\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation stripeCreateSetupIntentMutation($input: CreateSetupIntentMutationInput!) {\n    createSetupIntent(input: $input) {\n      setupIntent {\n        ...stripeSetupIntentFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation stripeCreateSetupIntentMutation($input: CreateSetupIntentMutationInput!) {\n    createSetupIntent(input: $input) {\n      setupIntent {\n        ...stripeSetupIntentFragment\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment stripePaymentMethodFragment on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n"): (typeof documents)["\n  fragment stripePaymentMethodFragment on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query stripeAllPaymentMethodsQuery {\n    allPaymentMethods(first: 100) @connection(key: \"stripe_allPaymentMethods\") {\n      edges {\n        node {\n          # commented only because of the broken apollo types: need to fix it after migration\n          #          ...stripePaymentMethodFragment @relay(mask: false)\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query stripeAllPaymentMethodsQuery {\n    allPaymentMethods(first: 100) @connection(key: \"stripe_allPaymentMethods\") {\n      edges {\n        node {\n          # commented only because of the broken apollo types: need to fix it after migration\n          #          ...stripePaymentMethodFragment @relay(mask: false)\n          ...stripePaymentMethodFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment stripeChargeFragment on StripeChargeType {\n    id\n    created\n    billingDetails\n    paymentMethod {\n      ...stripePaymentMethodFragment\n    }\n    amount\n    invoice {\n      id\n      subscription {\n        plan {\n          ...subscriptionPlanItemFragment\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment stripeChargeFragment on StripeChargeType {\n    id\n    created\n    billingDetails\n    paymentMethod {\n      ...stripePaymentMethodFragment\n    }\n    amount\n    invoice {\n      id\n      subscription {\n        plan {\n          ...subscriptionPlanItemFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query stripeAllChargesQuery {\n    allCharges {\n      edges {\n        node {\n          id\n          ...stripeChargeFragment\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query stripeAllChargesQuery {\n    allCharges {\n      edges {\n        node {\n          id\n          ...stripeChargeFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment stripePaymentIntentFragment on StripePaymentIntentType @inline {\n    id\n    amount\n    clientSecret\n    currency\n    pk\n  }\n"): (typeof documents)["\n  fragment stripePaymentIntentFragment on StripePaymentIntentType @inline {\n    id\n    amount\n    clientSecret\n    currency\n    pk\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query stripePaymentIntentQuery($id: ID!) {\n    paymentIntent(id: $id) {\n      ...stripePaymentIntentFragment\n    }\n  }\n"): (typeof documents)["\n  query stripePaymentIntentQuery($id: ID!) {\n    paymentIntent(id: $id) {\n      ...stripePaymentIntentFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment stripeSetupIntentFragment on StripeSetupIntentType @inline {\n    id\n    clientSecret\n  }\n"): (typeof documents)["\n  fragment stripeSetupIntentFragment on StripeSetupIntentType @inline {\n    id\n    clientSecret\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation subscriptionChangeActiveSubscriptionMutation($input: ChangeActiveSubscriptionMutationInput!) {\n    changeActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation subscriptionChangeActiveSubscriptionMutation($input: ChangeActiveSubscriptionMutationInput!) {\n    changeActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation subscriptionCancelActiveSubscriptionMutation($input: CancelActiveSubscriptionMutationInput!) {\n    cancelActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation subscriptionCancelActiveSubscriptionMutation($input: CancelActiveSubscriptionMutationInput!) {\n    cancelActiveSubscription(input: $input) {\n      subscriptionSchedule {\n        ...subscriptionActiveSubscriptionFragment\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment subscriptionPlanItemFragment on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    unitAmount\n  }\n"): (typeof documents)["\n  fragment subscriptionPlanItemFragment on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    unitAmount\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          ...subscriptionPlanItemFragment\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment\n    }\n  }\n"): (typeof documents)["\n  fragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          ...subscriptionPlanItemFragment\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query subscriptionPlansAllQuery {\n    allSubscriptionPlans(first: 100) {\n      edges {\n        node {\n          id\n          ...subscriptionPlanItemFragment\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query subscriptionPlansAllQuery {\n    allSubscriptionPlans(first: 100) {\n      edges {\n        node {\n          id\n          ...subscriptionPlanItemFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query subscriptionActivePlanDetailsQuery {\n    activeSubscription {\n      ...subscriptionActiveSubscriptionFragment\n    }\n  }\n"): (typeof documents)["\n  query subscriptionActivePlanDetailsQuery {\n    activeSubscription {\n      ...subscriptionActiveSubscriptionFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation addCrudDemoItemMutation($input: CreateCrudDemoItemMutationInput!) {\n    createCrudDemoItem(input: $input) {\n      crudDemoItemEdge {\n        node {\n          id\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation addCrudDemoItemMutation($input: CreateCrudDemoItemMutationInput!) {\n    createCrudDemoItem(input: $input) {\n      crudDemoItemEdge {\n        node {\n          id\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query crudDemoItemDetailsQuery($id: ID!) {\n    crudDemoItem(id: $id) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query crudDemoItemDetailsQuery($id: ID!) {\n    crudDemoItem(id: $id) {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query crudDemoItemListQuery {\n    allCrudDemoItems(first: 100) {\n      edges {\n        node {\n          id\n          ...crudDemoItemListItem\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query crudDemoItemListQuery {\n    allCrudDemoItems(first: 100) {\n      edges {\n        node {\n          id\n          ...crudDemoItemListItem\n        }\n      }\n    }\n  }\n"];
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
export function gql(source: "\n  query editCrudDemoItemQuery($id: ID!) {\n    crudDemoItem(id: $id) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query editCrudDemoItemQuery($id: ID!) {\n    crudDemoItem(id: $id) {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation editCrudDemoItemContentMutation($input: UpdateCrudDemoItemMutationInput!) {\n    updateCrudDemoItem(input: $input) {\n      crudDemoItem {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation editCrudDemoItemContentMutation($input: UpdateCrudDemoItemMutationInput!) {\n    updateCrudDemoItem(input: $input) {\n      crudDemoItem {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query demoItemQuery($id: String!) {\n    demoItem(id: $id) {\n      title\n      description\n      image {\n        url\n        title\n        description\n      }\n    }\n  }\n"): (typeof documents)["\n  query demoItemQuery($id: String!) {\n    demoItem(id: $id) {\n      title\n      description\n      image {\n        url\n        title\n        description\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n        query demoItemListItemTestQuery @relay_test_operation {\n          testItem: demoItem(id: \"contentful-item-1\") {\n            ...demoItemListItem_item\n          }\n        }\n      "): (typeof documents)["\n        query demoItemListItemTestQuery @relay_test_operation {\n          testItem: demoItem(id: \"contentful-item-1\") {\n            ...demoItemListItem_item\n          }\n        }\n      "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment demoItemListItem_item on DemoItem {\n    title\n    image {\n      title\n      url\n    }\n  }\n"): (typeof documents)["\n  fragment demoItemListItem_item on DemoItem {\n    title\n    image {\n      title\n      url\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query demoItemsAllQuery {\n    demoItemCollection {\n      items {\n        sys {\n          id\n        }\n        ...demoItemListItem_item\n      }\n    }\n  }\n"): (typeof documents)["\n  query demoItemsAllQuery {\n    demoItemCollection {\n      items {\n        sys {\n          id\n        }\n        ...demoItemListItem_item\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n      query documentListItemStoryQuery @relay_test_operation {\n        allDocumentDemoItems(first: 1) {\n          edges {\n            node {\n              ...documentListItem\n            }\n          }\n        }\n      }\n    "): (typeof documents)["\n      query documentListItemStoryQuery @relay_test_operation {\n        allDocumentDemoItems(first: 1) {\n          edges {\n            node {\n              ...documentListItem\n            }\n          }\n        }\n      }\n    "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment documentListItem on DocumentDemoItemType {\n    id\n    file {\n      url\n      name\n    }\n    createdAt\n  }\n"): (typeof documents)["\n  fragment documentListItem on DocumentDemoItemType {\n    id\n    file {\n      url\n      name\n    }\n    createdAt\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query documentsListQuery {\n    allDocumentDemoItems(first: 10) {\n      edges {\n        node {\n          id\n          createdAt\n          ...documentListItem\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query documentsListQuery {\n    allDocumentDemoItems(first: 10) {\n      edges {\n        node {\n          id\n          createdAt\n          ...documentListItem\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n      mutation documentsListCreateMutation($input: CreateDocumentDemoItemMutationInput!, $connections: [ID!]!) {\n        createDocumentDemoItem(input: $input) {\n          documentDemoItemEdge @appendEdge(connections: $connections) {\n            node {\n              createdAt\n              file {\n                name\n                url\n              }\n            }\n          }\n        }\n      }\n    "): (typeof documents)["\n      mutation documentsListCreateMutation($input: CreateDocumentDemoItemMutationInput!, $connections: [ID!]!) {\n        createDocumentDemoItem(input: $input) {\n          documentDemoItemEdge @appendEdge(connections: $connections) {\n            node {\n              createdAt\n              file {\n                name\n                url\n              }\n            }\n          }\n        }\n      }\n    "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation documentsDeleteMutation($input: DeleteDocumentDemoItemMutationInput!, $connections: [ID!]!) {\n      deleteDocumentDemoItem(input: $input) {\n        deletedIds @deleteEdge(connections: $connections)\n      }\n    }\n  "): (typeof documents)["\n    mutation documentsDeleteMutation($input: DeleteDocumentDemoItemMutationInput!, $connections: [ID!]!) {\n      deleteDocumentDemoItem(input: $input) {\n        deletedIds @deleteEdge(connections: $connections)\n      }\n    }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation loginFormMutation($input: ObtainTokenMutationInput!) {\n    tokenAuth(input: $input) {\n      access\n      refresh\n    }\n  }\n"): (typeof documents)["\n  mutation loginFormMutation($input: ObtainTokenMutationInput!) {\n    tokenAuth(input: $input) {\n      access\n      refresh\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation authSignupMutation($input: SingUpMutationInput!) {\n    signUp(input: $input) {\n      access\n      refresh\n    }\n  }\n"): (typeof documents)["\n  mutation authSignupMutation($input: SingUpMutationInput!) {\n    signUp(input: $input) {\n      access\n      refresh\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query stripeAllPaymentsMethodsQuery {\n    allPaymentMethods(first: 100) {\n      edges {\n        node {\n          id\n          pk\n          type\n          card\n          billingDetails\n          ...stripePaymentMethodFragment\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n"): (typeof documents)["\n  query stripeAllPaymentsMethodsQuery {\n    allPaymentMethods(first: 100) {\n      edges {\n        node {\n          id\n          pk\n          type\n          card\n          billingDetails\n          ...stripePaymentMethodFragment\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n"];
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
export function gql(source: "\n  subscription notificationsListSubscription {\n    notificationCreated {\n      edges {\n        node {\n          id\n          type\n          createdAt\n          readAt\n          data\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription notificationsListSubscription {\n    notificationCreated {\n      edges {\n        node {\n          id\n          type\n          createdAt\n          readAt\n          data\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment notificationsButtonContent on Query {\n    hasUnreadNotifications\n  }\n"): (typeof documents)["\n  fragment notificationsButtonContent on Query {\n    hasUnreadNotifications\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment notificationsListContentFragment on Query {\n    hasUnreadNotifications\n    allNotifications(first: $count, after: $cursor) {\n      edges {\n        node {\n          id\n          data\n          createdAt\n          readAt\n          type\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment notificationsListContentFragment on Query {\n    hasUnreadNotifications\n    allNotifications(first: $count, after: $cursor) {\n      edges {\n        node {\n          id\n          data\n          createdAt\n          readAt\n          type\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation notificationsListMarkAsReadMutation($input: MarkReadAllNotificationsMutationInput!) {\n    markReadAllNotifications(input: $input) {\n      ok\n    }\n  }\n"): (typeof documents)["\n  mutation notificationsListMarkAsReadMutation($input: MarkReadAllNotificationsMutationInput!) {\n    markReadAllNotifications(input: $input) {\n      ok\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment subscriptionActiveSubscriptionFragment_ on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          ...subscriptionPlanItemFragment_\n          id\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n      id\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment_\n      id\n    }\n  }\n\n  fragment subscriptionPlanItemFragment_ on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    unitAmount\n  }\n\n  fragment stripePaymentMethodFragment_ on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n"): (typeof documents)["\n  fragment subscriptionActiveSubscriptionFragment_ on SubscriptionScheduleType {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          ...subscriptionPlanItemFragment_\n          id\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n      id\n    }\n    canActivateTrial\n    defaultPaymentMethod {\n      ...stripePaymentMethodFragment_\n      id\n    }\n  }\n\n  fragment subscriptionPlanItemFragment_ on SubscriptionPlanType {\n    id\n    pk\n    product {\n      id\n      name\n    }\n    unitAmount\n  }\n\n  fragment stripePaymentMethodFragment_ on StripePaymentMethodType {\n    id\n    pk\n    type\n    card\n    billingDetails\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query subscriptionActivePlanDetailsQuery_ {\n    activeSubscription {\n      ...subscriptionActiveSubscriptionFragment_\n      id\n    }\n  }\n"): (typeof documents)["\n  query subscriptionActivePlanDetailsQuery_ {\n    activeSubscription {\n      ...subscriptionActiveSubscriptionFragment_\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n      mutation useFavoriteDemoItemListCreateMutation(\n        $input: CreateFavoriteContentfulDemoItemMutationInput!\n        $connections: [ID!]!\n      ) {\n        createFavoriteContentfulDemoItem(input: $input) {\n          contentfulDemoItemFavoriteEdge @appendEdge(connections: $connections) {\n            node {\n              ...useFavoriteDemoItem_item @relay(mask: false)\n            }\n          }\n        }\n      }\n    "): (typeof documents)["\n      mutation useFavoriteDemoItemListCreateMutation(\n        $input: CreateFavoriteContentfulDemoItemMutationInput!\n        $connections: [ID!]!\n      ) {\n        createFavoriteContentfulDemoItem(input: $input) {\n          contentfulDemoItemFavoriteEdge @appendEdge(connections: $connections) {\n            node {\n              ...useFavoriteDemoItem_item @relay(mask: false)\n            }\n          }\n        }\n      }\n    "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n      mutation useFavoriteDemoItemListDeleteMutation(\n        $input: DeleteFavoriteContentfulDemoItemMutationInput!\n        $connections: [ID!]!\n      ) {\n        deleteFavoriteContentfulDemoItem(input: $input) {\n          deletedIds @deleteEdge(connections: $connections)\n        }\n      }\n    "): (typeof documents)["\n      mutation useFavoriteDemoItemListDeleteMutation(\n        $input: DeleteFavoriteContentfulDemoItemMutationInput!\n        $connections: [ID!]!\n      ) {\n        deleteFavoriteContentfulDemoItem(input: $input) {\n          deletedIds @deleteEdge(connections: $connections)\n        }\n      }\n    "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment useFavoriteDemoItem_item on ContentfulDemoItemFavoriteType {\n    item {\n      pk\n    }\n  }\n"): (typeof documents)["\n  fragment useFavoriteDemoItem_item on ContentfulDemoItemFavoriteType {\n    item {\n      pk\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n      query useFavoriteDemoItemListQuery {\n        allContentfulDemoItemFavorites(first: 100)\n          @connection(key: \"useFavoriteDemoItemListQuery__allContentfulDemoItemFavorites\") {\n          edges {\n            node {\n              ...useFavoriteDemoItem_item @relay(mask: false)\n            }\n          }\n        }\n      }\n    "): (typeof documents)["\n      query useFavoriteDemoItemListQuery {\n        allContentfulDemoItemFavorites(first: 100)\n          @connection(key: \"useFavoriteDemoItemListQuery__allContentfulDemoItemFavorites\") {\n          edges {\n            node {\n              ...useFavoriteDemoItem_item @relay(mask: false)\n            }\n          }\n        }\n      }\n    "];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;