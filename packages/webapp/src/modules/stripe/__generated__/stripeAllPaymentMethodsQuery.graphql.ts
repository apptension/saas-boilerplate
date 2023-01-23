/**
 * @generated SignedSource<<6fe269b4b73a5a979d6e4e87a86f7a8e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PaymentMethodType = "ACSS_DEBIT" | "AFTERPAY_CLEARPAY" | "ALIPAY" | "AU_BECS_DEBIT" | "BACS_DEBIT" | "BANCONTACT" | "BOLETO" | "CARD" | "CARD_PRESENT" | "EPS" | "FPX" | "GIROPAY" | "GRABPAY" | "IDEAL" | "INTERAC_PRESENT" | "KLARNA" | "OXXO" | "P24" | "SEPA_DEBIT" | "SOFORT" | "WECHAT_PAY" | "%future added value";
export type stripeAllPaymentMethodsQuery$variables = {};
export type stripeAllPaymentMethodsQuery$data = {
  readonly allPaymentMethods: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly billingDetails: any | null;
        readonly card: any | null;
        readonly id: string;
        readonly pk: string | null;
        readonly type: PaymentMethodType;
        readonly " $fragmentSpreads": FragmentRefs<"stripePaymentMethodFragment">;
      } | null;
    } | null>;
  } | null;
};
export type stripeAllPaymentMethodsQuery = {
  response: stripeAllPaymentMethodsQuery$data;
  variables: stripeAllPaymentMethodsQuery$variables;
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
  "name": "pk",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "card",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "billingDetails",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v8 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "stripeAllPaymentMethodsQuery",
    "selections": [
      {
        "alias": "allPaymentMethods",
        "args": null,
        "concreteType": "PaymentMethodConnection",
        "kind": "LinkedField",
        "name": "__stripe_allPaymentMethods_connection",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PaymentMethodEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "StripePaymentMethodType",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v0/*: any*/),
                  (v1/*: any*/),
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "stripePaymentMethodFragment"
                  },
                  (v5/*: any*/)
                ],
                "storageKey": null
              },
              (v6/*: any*/)
            ],
            "storageKey": null
          },
          (v7/*: any*/)
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
    "name": "stripeAllPaymentMethodsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v8/*: any*/),
        "concreteType": "PaymentMethodConnection",
        "kind": "LinkedField",
        "name": "allPaymentMethods",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PaymentMethodEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "StripePaymentMethodType",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v0/*: any*/),
                  (v1/*: any*/),
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/)
                ],
                "storageKey": null
              },
              (v6/*: any*/)
            ],
            "storageKey": null
          },
          (v7/*: any*/)
        ],
        "storageKey": "allPaymentMethods(first:100)"
      },
      {
        "alias": null,
        "args": (v8/*: any*/),
        "filters": null,
        "handle": "connection",
        "key": "stripe_allPaymentMethods",
        "kind": "LinkedHandle",
        "name": "allPaymentMethods"
      }
    ]
  },
  "params": {
    "cacheID": "7ec467f4da5d0f392631c3d444eb4705",
    "id": null,
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "allPaymentMethods"
          ]
        }
      ]
    },
    "name": "stripeAllPaymentMethodsQuery",
    "operationKind": "query",
    "text": "query stripeAllPaymentMethodsQuery {\n  allPaymentMethods(first: 100) {\n    edges {\n      node {\n        id\n        pk\n        type\n        card\n        billingDetails\n        ...stripePaymentMethodFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment stripePaymentMethodFragment on StripePaymentMethodType {\n  id\n  pk\n  type\n  card\n  billingDetails\n}\n"
  }
};
})();

(node as any).hash = "2e0edcda460d9a75841238ac13593091";

export default node;
