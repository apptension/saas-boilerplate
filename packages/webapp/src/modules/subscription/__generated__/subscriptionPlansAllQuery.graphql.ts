/**
 * @generated SignedSource<<446e6e3373af74e7c29b2e5fa095237c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type subscriptionPlansAllQuery$variables = {};
export type subscriptionPlansAllQuery$data = {
  readonly allSubscriptionPlans: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"subscriptionPlanItemFragment">;
      } | null;
    } | null>;
  } | null;
};
export type subscriptionPlansAllQuery = {
  response: subscriptionPlansAllQuery$data;
  variables: subscriptionPlansAllQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v1 = {
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
    "name": "subscriptionPlansAllQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "SubscriptionPlanConnection",
        "kind": "LinkedField",
        "name": "allSubscriptionPlans",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SubscriptionPlanEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SubscriptionPlanType",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "subscriptionPlanItemFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "allSubscriptionPlans(first:100)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "subscriptionPlansAllQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "SubscriptionPlanConnection",
        "kind": "LinkedField",
        "name": "allSubscriptionPlans",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SubscriptionPlanEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SubscriptionPlanType",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
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
                      (v1/*: any*/),
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
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "allSubscriptionPlans(first:100)"
      }
    ]
  },
  "params": {
    "cacheID": "011139f1dc1b9e01a0412f3c007a77bf",
    "id": null,
    "metadata": {},
    "name": "subscriptionPlansAllQuery",
    "operationKind": "query",
    "text": "query subscriptionPlansAllQuery {\n  allSubscriptionPlans(first: 100) {\n    edges {\n      node {\n        id\n        ...subscriptionPlanItemFragment\n      }\n    }\n  }\n}\n\nfragment subscriptionPlanItemFragment on SubscriptionPlanType {\n  id\n  pk\n  product {\n    id\n    name\n  }\n  unitAmount\n}\n"
  }
};
})();

(node as any).hash = "675d1a7296f3477f58a1aecb5488636e";

export default node;
