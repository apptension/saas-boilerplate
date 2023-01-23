/**
 * @generated SignedSource<<f2ee388937156855582b56d8c70e14b5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type PasswordResetConfirmationMutationInput = {
  clientMutationId?: string | null;
  newPassword: string;
  token: string;
  user: string;
};
export type authRequestPasswordResetConfirmMutation$variables = {
  input: PasswordResetConfirmationMutationInput;
};
export type authRequestPasswordResetConfirmMutation$data = {
  readonly passwordResetConfirm: {
    readonly ok: boolean | null;
  } | null;
};
export type authRequestPasswordResetConfirmMutation = {
  response: authRequestPasswordResetConfirmMutation$data;
  variables: authRequestPasswordResetConfirmMutation$variables;
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
    "concreteType": "PasswordResetConfirmationMutationPayload",
    "kind": "LinkedField",
    "name": "passwordResetConfirm",
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
    "name": "authRequestPasswordResetConfirmMutation",
    "selections": (v1/*: any*/),
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "authRequestPasswordResetConfirmMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9b0508804aef38b96a08816f769be7a8",
    "id": null,
    "metadata": {},
    "name": "authRequestPasswordResetConfirmMutation",
    "operationKind": "mutation",
    "text": "mutation authRequestPasswordResetConfirmMutation(\n  $input: PasswordResetConfirmationMutationInput!\n) {\n  passwordResetConfirm(input: $input) {\n    ok\n  }\n}\n"
  }
};
})();

(node as any).hash = "388e41eb209d5beb319872e62e63039f";

export default node;
