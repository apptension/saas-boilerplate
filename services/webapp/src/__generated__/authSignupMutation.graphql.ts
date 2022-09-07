/**
 * @generated SignedSource<<264bbfd4c6c85c2da20382c52779cd0a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type SingUpMutationInput = {
  clientMutationId?: string | null;
  email: string;
  id?: string | null;
  password: string;
};
export type authSignupMutation$variables = {
  input: SingUpMutationInput;
};
export type authSignupMutation$data = {
  readonly signUp: {
    readonly access: string | null;
    readonly refresh: string | null;
  } | null;
};
export type authSignupMutation = {
  response: authSignupMutation$data;
  variables: authSignupMutation$variables;
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
    "concreteType": "SingUpMutationPayload",
    "kind": "LinkedField",
    "name": "signUp",
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
    "name": "authSignupMutation",
    "selections": (v1/*: any*/),
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "authSignupMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "72e6042765627326b0a0f93cd7fb702a",
    "id": null,
    "metadata": {},
    "name": "authSignupMutation",
    "operationKind": "mutation",
    "text": "mutation authSignupMutation(\n  $input: SingUpMutationInput!\n) {\n  signUp(input: $input) {\n    access\n    refresh\n  }\n}\n"
  }
};
})();

(node as any).hash = "f8642961553bcb1a663ee79aba4bbb45";

export default node;
