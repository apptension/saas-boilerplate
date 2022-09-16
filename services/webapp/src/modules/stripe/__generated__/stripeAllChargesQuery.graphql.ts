/**
 * @generated SignedSource<<9852ed1526a2847044e2b39f7b98778c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type stripeAllChargesQuery$variables = {};
export type stripeAllChargesQuery$data = {
  readonly allCharges: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"stripeChargeFragment">;
      } | null;
    } | null>;
  } | null;
};
export type stripeAllChargesQuery = {
  response: stripeAllChargesQuery$data;
  variables: stripeAllChargesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "billingDetails",
  "storageKey": null
},
v2 = {
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
    "name": "stripeAllChargesQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ChargeConnection",
        "kind": "LinkedField",
        "name": "allCharges",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ChargeEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "StripeChargeType",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v0/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "stripeChargeFragment"
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "stripeAllChargesQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ChargeConnection",
        "kind": "LinkedField",
        "name": "allCharges",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ChargeEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "StripeChargeType",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v0/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "created",
                    "storageKey": null
                  },
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "StripePaymentMethodType",
                    "kind": "LinkedField",
                    "name": "paymentMethod",
                    "plural": false,
                    "selections": [
                      (v0/*: any*/),
                      (v2/*: any*/),
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
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "amount",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "StripeInvoiceType",
                    "kind": "LinkedField",
                    "name": "invoice",
                    "plural": false,
                    "selections": [
                      (v0/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "StripeSubscriptionType",
                        "kind": "LinkedField",
                        "name": "subscription",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "SubscriptionPlanType",
                            "kind": "LinkedField",
                            "name": "plan",
                            "plural": false,
                            "selections": [
                              (v0/*: any*/),
                              (v2/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "StripeProductType",
                                "kind": "LinkedField",
                                "name": "product",
                                "plural": false,
                                "selections": [
                                  (v0/*: any*/),
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
                          (v0/*: any*/)
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
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "013b13aa35b0ffe7e043ce3367a0dd03",
    "id": null,
    "metadata": {},
    "name": "stripeAllChargesQuery",
    "operationKind": "query",
    "text": "query stripeAllChargesQuery {\n  allCharges {\n    edges {\n      node {\n        id\n        ...stripeChargeFragment\n      }\n    }\n  }\n}\n\nfragment stripeChargeFragment on StripeChargeType {\n  id\n  created\n  billingDetails\n  paymentMethod {\n    ...stripePaymentMethodFragment\n    id\n  }\n  amount\n  invoice {\n    id\n    subscription {\n      plan {\n        ...subscriptionPlanItemFragment\n        id\n      }\n      id\n    }\n  }\n}\n\nfragment stripePaymentMethodFragment on StripePaymentMethodType {\n  id\n  pk\n  type\n  card\n  billingDetails\n}\n\nfragment subscriptionPlanItemFragment on SubscriptionPlanType {\n  id\n  pk\n  product {\n    id\n    name\n  }\n  unitAmount\n}\n"
  }
};
})();

(node as any).hash = "fb83fdd591f2bc7a307ce8fa5586af10";

export default node;
