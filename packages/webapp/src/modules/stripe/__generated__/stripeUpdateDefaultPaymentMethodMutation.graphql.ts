/**
 * @generated SignedSource<<f0227c67fd923a34e70787e0b2492bb1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PaymentMethodType = "ACSS_DEBIT" | "AFTERPAY_CLEARPAY" | "ALIPAY" | "AU_BECS_DEBIT" | "BACS_DEBIT" | "BANCONTACT" | "BOLETO" | "CARD" | "CARD_PRESENT" | "EPS" | "FPX" | "GIROPAY" | "GRABPAY" | "IDEAL" | "INTERAC_PRESENT" | "KLARNA" | "OXXO" | "P24" | "SEPA_DEBIT" | "SOFORT" | "WECHAT_PAY" | "%future added value";
export type UpdateDefaultPaymentMethodMutationInput = {
  clientMutationId?: string | null;
  id?: string | null;
};
export type stripeUpdateDefaultPaymentMethodMutation$variables = {
  connections: ReadonlyArray<string>;
  input: UpdateDefaultPaymentMethodMutationInput;
};
export type stripeUpdateDefaultPaymentMethodMutation$data = {
  readonly updateDefaultPaymentMethod: {
    readonly activeSubscription: {
      readonly " $fragmentSpreads": FragmentRefs<"subscriptionActiveSubscriptionFragment">;
    } | null;
    readonly paymentMethodEdge: {
      readonly node: {
        readonly billingDetails: any | null;
        readonly card: any | null;
        readonly id: string;
        readonly pk: string | null;
        readonly type: PaymentMethodType;
        readonly " $fragmentSpreads": FragmentRefs<"stripePaymentMethodFragment">;
      } | null;
    } | null;
  } | null;
};
export type stripeUpdateDefaultPaymentMethodMutation = {
  response: stripeUpdateDefaultPaymentMethodMutation$data;
  variables: stripeUpdateDefaultPaymentMethodMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connections"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pk",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "card",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "billingDetails",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startDate",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "trialEnd",
  "storageKey": null
},
v10 = [
  (v3/*: any*/),
  (v4/*: any*/),
  (v5/*: any*/),
  (v6/*: any*/),
  (v7/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "stripeUpdateDefaultPaymentMethodMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "UpdateDefaultPaymentMethodMutationPayload",
        "kind": "LinkedField",
        "name": "updateDefaultPaymentMethod",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SubscriptionScheduleType",
            "kind": "LinkedField",
            "name": "activeSubscription",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "subscriptionActiveSubscriptionFragment"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PaymentMethodEdge",
            "kind": "LinkedField",
            "name": "paymentMethodEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "StripePaymentMethodType",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "stripePaymentMethodFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "stripeUpdateDefaultPaymentMethodMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "UpdateDefaultPaymentMethodMutationPayload",
        "kind": "LinkedField",
        "name": "updateDefaultPaymentMethod",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SubscriptionScheduleType",
            "kind": "LinkedField",
            "name": "activeSubscription",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SubscriptionSchedulePhaseType",
                "kind": "LinkedField",
                "name": "phases",
                "plural": true,
                "selections": [
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endDate",
                    "storageKey": null
                  },
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SubscriptionSchedulePhaseItemType",
                    "kind": "LinkedField",
                    "name": "item",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SubscriptionPlanType",
                        "kind": "LinkedField",
                        "name": "price",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "StripeProductType",
                            "kind": "LinkedField",
                            "name": "product",
                            "plural": false,
                            "selections": [
                              (v3/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "name",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "unitAmount",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "quantity",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "StripeSubscriptionType",
                "kind": "LinkedField",
                "name": "subscription",
                "plural": false,
                "selections": [
                  (v8/*: any*/),
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "trialStart",
                    "storageKey": null
                  },
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "canActivateTrial",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "StripePaymentMethodType",
                "kind": "LinkedField",
                "name": "defaultPaymentMethod",
                "plural": false,
                "selections": (v10/*: any*/),
                "storageKey": null
              },
              (v3/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PaymentMethodEdge",
            "kind": "LinkedField",
            "name": "paymentMethodEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "StripePaymentMethodType",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": (v10/*: any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "appendEdge",
            "key": "",
            "kind": "LinkedHandle",
            "name": "paymentMethodEdge",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d4b7e68afffdc80835445de063dc89a8",
    "id": null,
    "metadata": {},
    "name": "stripeUpdateDefaultPaymentMethodMutation",
    "operationKind": "mutation",
    "text": "mutation stripeUpdateDefaultPaymentMethodMutation(\n  $input: UpdateDefaultPaymentMethodMutationInput!\n) {\n  updateDefaultPaymentMethod(input: $input) {\n    activeSubscription {\n      ...subscriptionActiveSubscriptionFragment\n      id\n    }\n    paymentMethodEdge {\n      node {\n        id\n        pk\n        type\n        card\n        billingDetails\n        ...stripePaymentMethodFragment\n      }\n    }\n  }\n}\n\nfragment stripePaymentMethodFragment on StripePaymentMethodType {\n  id\n  pk\n  type\n  card\n  billingDetails\n}\n\nfragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {\n  phases {\n    startDate\n    endDate\n    trialEnd\n    item {\n      price {\n        ...subscriptionPlanItemFragment\n        id\n      }\n      quantity\n    }\n  }\n  subscription {\n    startDate\n    trialEnd\n    trialStart\n    id\n  }\n  canActivateTrial\n  defaultPaymentMethod {\n    ...stripePaymentMethodFragment\n    id\n  }\n}\n\nfragment subscriptionPlanItemFragment on SubscriptionPlanType {\n  id\n  pk\n  product {\n    id\n    name\n  }\n  unitAmount\n}\n"
  }
};
})();

(node as any).hash = "074aa4323fc493518b8104a99e7961c7";

export default node;
