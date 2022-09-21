/**
 * @generated SignedSource<<1d35cf7a6713e475ee1b5b90ba40a1c4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type stripePaymentIntentQuery$variables = {
  id: string;
};
export type stripePaymentIntentQuery$data = {
  readonly paymentIntent: {
    readonly " $fragmentSpreads": FragmentRefs<"stripePaymentIntentFragment">;
  } | null;
};
export type stripePaymentIntentQuery = {
  response: stripePaymentIntentQuery$data;
  variables: stripePaymentIntentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
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
    "kind": "ScalarField",
    "name": "clientSecret",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "currency",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "pk",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "stripePaymentIntentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "StripePaymentIntentType",
        "kind": "LinkedField",
        "name": "paymentIntent",
        "plural": false,
        "selections": [
          {
            "kind": "InlineDataFragmentSpread",
            "name": "stripePaymentIntentFragment",
            "selections": (v2/*: any*/),
            "args": null,
            "argumentDefinitions": []
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "stripePaymentIntentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "StripePaymentIntentType",
        "kind": "LinkedField",
        "name": "paymentIntent",
        "plural": false,
        "selections": (v2/*: any*/),
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "bde978429eba24f0f4ff27f9f745ad70",
    "id": null,
    "metadata": {},
    "name": "stripePaymentIntentQuery",
    "operationKind": "query",
    "text": "query stripePaymentIntentQuery(\n  $id: ID!\n) {\n  paymentIntent(id: $id) {\n    ...stripePaymentIntentFragment\n    id\n  }\n}\n\nfragment stripePaymentIntentFragment on StripePaymentIntentType {\n  id\n  amount\n  clientSecret\n  currency\n  pk\n}\n"
  }
};
})();

(node as any).hash = "7113f883760ae8c92fbaf51ddb76d983";

export default node;
