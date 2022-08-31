/**
 * @generated SignedSource<<535d12ee6f7e29deff75564a047dfcd1>>
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
    readonly canActivateTrial: boolean | null;
    readonly phases: ReadonlyArray<{
      readonly endDate: string | null;
      readonly item: {
        readonly price: {
          readonly " $fragmentSpreads": FragmentRefs<"subscriptionPlanItemFragment">;
        } | null;
        readonly quantity: number | null;
      } | null;
      readonly startDate: String | null;
      readonly trialEnd: string | null;
    } | null> | null;
    readonly subscription: {
      readonly startDate: String | null;
      readonly trialEnd: String | null;
      readonly trialStart: String | null;
    } | null;
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
  "name": "endDate",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "trialEnd",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quantity",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "trialStart",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "canActivateTrial",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
            "alias": null,
            "args": null,
            "concreteType": "SubscriptionSchedulePhaseType",
            "kind": "LinkedField",
            "name": "phases",
            "plural": true,
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/),
              (v2/*: any*/),
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
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "subscriptionPlanItemFragment"
                      }
                    ],
                    "storageKey": null
                  },
                  (v3/*: any*/)
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
              (v2/*: any*/),
              (v4/*: any*/)
            ],
            "storageKey": null
          },
          (v5/*: any*/)
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
              (v1/*: any*/),
              (v2/*: any*/),
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
                      (v6/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "pk",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "StripeProductType",
                        "kind": "LinkedField",
                        "name": "product",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
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
                  (v3/*: any*/)
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
              (v2/*: any*/),
              (v4/*: any*/),
              (v6/*: any*/)
            ],
            "storageKey": null
          },
          (v5/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "962d903b4df0b49aff2401800ff319ea",
    "id": null,
    "metadata": {},
    "name": "subscriptionActivePlanDetailsQuery",
    "operationKind": "query",
    "text": "query subscriptionActivePlanDetailsQuery {\n  activeSubscription {\n    phases {\n      startDate\n      endDate\n      trialEnd\n      item {\n        price {\n          ...subscriptionPlanItemFragment\n          id\n        }\n        quantity\n      }\n    }\n    subscription {\n      startDate\n      trialEnd\n      trialStart\n      id\n    }\n    canActivateTrial\n    id\n  }\n}\n\nfragment subscriptionPlanItemFragment on SubscriptionPlanType {\n  id\n  pk\n  product {\n    id\n    name\n  }\n  unitAmount\n}\n"
  }
};
})();

(node as any).hash = "985316b8409122ab2baddf2acaa406db";

export default node;
