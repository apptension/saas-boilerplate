/**
 * @generated SignedSource<<7608ae33d5f01cea4d24067ae853df33>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdatePaymentIntentMutationInput = {
  clientMutationId?: string | null;
  id: string;
  product: string;
};
export type stripeUpdatePaymentIntentMutation$variables = {
  input: UpdatePaymentIntentMutationInput;
};
export type stripeUpdatePaymentIntentMutation$data = {
  readonly updatePaymentIntent: {
    readonly paymentIntent: {
      readonly " $fragmentSpreads": FragmentRefs<"stripePaymentIntentFragment">;
    } | null;
  } | null;
};
export type stripeUpdatePaymentIntentMutation = {
  response: stripeUpdatePaymentIntentMutation$data;
  variables: stripeUpdatePaymentIntentMutation$variables;
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
    "name": "stripeUpdatePaymentIntentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePaymentIntentMutationPayload",
        "kind": "LinkedField",
        "name": "updatePaymentIntent",
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
    "name": "stripeUpdatePaymentIntentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePaymentIntentMutationPayload",
        "kind": "LinkedField",
        "name": "updatePaymentIntent",
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
    "cacheID": "80f440441b4f7a032f9e6b2ebf7c1a19",
    "id": null,
    "metadata": {},
    "name": "stripeUpdatePaymentIntentMutation",
    "operationKind": "mutation",
    "text": "mutation stripeUpdatePaymentIntentMutation(\n  $input: UpdatePaymentIntentMutationInput!\n) {\n  updatePaymentIntent(input: $input) {\n    paymentIntent {\n      ...stripePaymentIntentFragment\n      id\n    }\n  }\n}\n\nfragment stripePaymentIntentFragment on StripePaymentIntentType {\n  id\n  amount\n  clientSecret\n  currency\n  pk\n}\n"
  }
};
})();

(node as any).hash = "42c3a017df8436cce513defe701615ce";

export default node;
