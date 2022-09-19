/**
 * @generated SignedSource<<29e9ed3556cf593f8214cdab5cc73e3b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type subscriptionActivePlanDetailsQuery$variables = {};
export type subscriptionActivePlanDetailsQuery$data = {
  readonly activeSubscription: {
    readonly " $fragmentSpreads": FragmentRefs<"subscriptionActiveSubscriptionFragment">;
  } | null;
};
export type subscriptionActivePlanDetailsQuery = {
  response: subscriptionActivePlanDetailsQuery$data;
  variables: subscriptionActivePlanDetailsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startDate",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "trialEnd",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pk",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "subscriptionActivePlanDetailsQuery",
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
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "subscriptionActivePlanDetailsQuery",
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
              (v0/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endDate",
                "storageKey": null
              },
              (v1/*: any*/),
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
                      (v2/*: any*/),
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "StripeProductType",
                        "kind": "LinkedField",
                        "name": "product",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/),
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
              (v0/*: any*/),
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "trialStart",
                "storageKey": null
              },
              (v2/*: any*/)
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
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "type",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "card",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "billingDetails",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "aba2bce29f2c8d21966ae687c923fcd5",
    "id": null,
    "metadata": {},
    "name": "subscriptionActivePlanDetailsQuery",
    "operationKind": "query",
    "text": "query subscriptionActivePlanDetailsQuery {\n  activeSubscription {\n    ...subscriptionActiveSubscriptionFragment\n    id\n  }\n}\n\nfragment stripePaymentMethodFragment on StripePaymentMethodType {\n  id\n  pk\n  type\n  card\n  billingDetails\n}\n\nfragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {\n  phases {\n    startDate\n    endDate\n    trialEnd\n    item {\n      price {\n        ...subscriptionPlanItemFragment\n        id\n      }\n      quantity\n    }\n  }\n  subscription {\n    startDate\n    trialEnd\n    trialStart\n    id\n  }\n  canActivateTrial\n  defaultPaymentMethod {\n    ...stripePaymentMethodFragment\n    id\n  }\n}\n\nfragment subscriptionPlanItemFragment on SubscriptionPlanType {\n  id\n  pk\n  product {\n    id\n    name\n  }\n  unitAmount\n}\n"
  }
};
})();

(node as any).hash = "285cabd16cd893e21bff335460aec4be";

export default node;
