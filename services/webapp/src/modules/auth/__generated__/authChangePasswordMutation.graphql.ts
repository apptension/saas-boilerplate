/**
 * @generated SignedSource<<a2da530363d7971c87604ff061fd9d37>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ChangePasswordMutationInput = {
  clientMutationId?: string | null;
  newPassword: string;
  oldPassword: string;
};
export type authChangePasswordMutation$variables = {
  input: ChangePasswordMutationInput;
};
export type authChangePasswordMutation$data = {
  readonly changePassword: {
    readonly access: string | null;
    readonly refresh: string | null;
  } | null;
};
export type authChangePasswordMutation = {
  response: authChangePasswordMutation$data;
  variables: authChangePasswordMutation$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "ChangePasswordMutationPayload",
    "kind": "LinkedField",
    "name": "changePassword",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "access",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "refresh",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "authChangePasswordMutation",
    "selections": (v1/*: any*/),
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "authChangePasswordMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "409483ab8b9616f51b5d2e19d22a560b",
    "id": null,
    "metadata": {},
    "name": "authChangePasswordMutation",
    "operationKind": "mutation",
    "text": "mutation authChangePasswordMutation(\n  $input: ChangePasswordMutationInput!\n) {\n  changePassword(input: $input) {\n    access\n    refresh\n  }\n}\n"
  }
};
})();

(node as any).hash = "d1f08bd7ee08471537b175af082ea81a";

export default node;
