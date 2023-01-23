/**
 * @generated SignedSource<<e4dcc49e696ee02d5ebdf6064b2db868>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CreatePaymentIntentMutationInput = {
  clientMutationId?: string | null;
  product: string;
};
export type stripeCreatePaymentIntentMutation$variables = {
  input: CreatePaymentIntentMutationInput;
};
export type stripeCreatePaymentIntentMutation$data = {
  readonly createPaymentIntent: {
    readonly paymentIntent: {
      readonly " $fragmentSpreads": FragmentRefs<"stripePaymentIntentFragment">;
    } | null;
  } | null;
};
export type stripeCreatePaymentIntentMutation = {
  response: stripeCreatePaymentIntentMutation$data;
  variables: stripeCreatePaymentIntentMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
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
    "name": "stripeCreatePaymentIntentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreatePaymentIntentMutationPayload",
        "kind": "LinkedField",
        "name": "createPaymentIntent",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
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
        "storageKey": null
      }
    ],
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "stripeCreatePaymentIntentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreatePaymentIntentMutationPayload",
        "kind": "LinkedField",
        "name": "createPaymentIntent",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "StripePaymentIntentType",
            "kind": "LinkedField",
            "name": "paymentIntent",
            "plural": false,
            "selections": (v2/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d00e76689b1934286e6fcbd6bdb8ce98",
    "id": null,
    "metadata": {},
    "name": "stripeCreatePaymentIntentMutation",
    "operationKind": "mutation",
    "text": "mutation stripeCreatePaymentIntentMutation(\n  $input: CreatePaymentIntentMutationInput!\n) {\n  createPaymentIntent(input: $input) {\n    paymentIntent {\n      ...stripePaymentIntentFragment\n      id\n    }\n  }\n}\n\nfragment stripePaymentIntentFragment on StripePaymentIntentType {\n  id\n  amount\n  clientSecret\n  currency\n  pk\n}\n"
  }
};
})();

(node as any).hash = "e6d6034c4697988f8678e5e2789650d9";

export default node;
