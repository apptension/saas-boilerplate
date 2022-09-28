/**
 * @generated SignedSource<<7f2c4f70967c29b082cef13b144716b9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type PasswordResetMutationInput = {
  clientMutationId?: string | null;
  email: string;
};
export type authRequestPasswordResetMutation$variables = {
  input: PasswordResetMutationInput;
};
export type authRequestPasswordResetMutation$data = {
  readonly passwordReset: {
    readonly ok: boolean | null;
  } | null;
};
export type authRequestPasswordResetMutation = {
  response: authRequestPasswordResetMutation$data;
  variables: authRequestPasswordResetMutation$variables;
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
    "concreteType": "PasswordResetMutationPayload",
    "kind": "LinkedField",
    "name": "passwordReset",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
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
    "name": "authRequestPasswordResetMutation",
    "selections": (v1/*: any*/),
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "authRequestPasswordResetMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "bd657aa6317cdac3dfb542b4e696e734",
    "id": null,
    "metadata": {},
    "name": "authRequestPasswordResetMutation",
    "operationKind": "mutation",
    "text": "mutation authRequestPasswordResetMutation(\n  $input: PasswordResetMutationInput!\n) {\n  passwordReset(input: $input) {\n    ok\n  }\n}\n"
  }
};
})();

(node as any).hash = "0e16bbef9ad87fa016b11acf037cd2d8";

export default node;
