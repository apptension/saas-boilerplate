/**
 * @generated SignedSource<<807a8b193517498cd1f9427a31198f34>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeletePaymentMethodMutationInput = {
  clientMutationId?: string | null;
  id?: string | null;
};
export type stripeDeletePaymentMethodMutation$variables = {
  connections: ReadonlyArray<string>;
  input: DeletePaymentMethodMutationInput;
};
export type stripeDeletePaymentMethodMutation$data = {
  readonly deletePaymentMethod: {
    readonly deletedIds: ReadonlyArray<string | null> | null;
  } | null;
};
export type stripeDeletePaymentMethodMutation = {
  response: stripeDeletePaymentMethodMutation$data;
  variables: stripeDeletePaymentMethodMutation$variables;
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
  "name": "deletedIds",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "stripeDeletePaymentMethodMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeletePaymentMethodMutationPayload",
        "kind": "LinkedField",
        "name": "deletePaymentMethod",
        "plural": false,
        "selections": [
          (v3/*: any*/)
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
    "name": "stripeDeletePaymentMethodMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeletePaymentMethodMutationPayload",
        "kind": "LinkedField",
        "name": "deletePaymentMethod",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteEdge",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedIds",
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
    "cacheID": "1a5d21eef69407c30b8f021471841b3a",
    "id": null,
    "metadata": {},
    "name": "stripeDeletePaymentMethodMutation",
    "operationKind": "mutation",
    "text": "mutation stripeDeletePaymentMethodMutation(\n  $input: DeletePaymentMethodMutationInput!\n) {\n  deletePaymentMethod(input: $input) {\n    deletedIds\n  }\n}\n"
  }
};
})();

(node as any).hash = "b7e2d40cd2ddcb6eda3bfcbb1b0843bf";

export default node;
