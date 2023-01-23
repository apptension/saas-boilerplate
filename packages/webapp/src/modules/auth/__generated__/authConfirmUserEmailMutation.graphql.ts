/**
 * @generated SignedSource<<1fabfaaec0607d1ba105bf7192a37988>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ConfirmEmailMutationInput = {
  clientMutationId?: string | null;
  token: string;
  user: string;
};
export type authConfirmUserEmailMutation$variables = {
  input: ConfirmEmailMutationInput;
};
export type authConfirmUserEmailMutation$data = {
  readonly confirm: {
    readonly ok: boolean | null;
  } | null;
};
export type authConfirmUserEmailMutation = {
  response: authConfirmUserEmailMutation$data;
  variables: authConfirmUserEmailMutation$variables;
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
    "concreteType": "ConfirmEmailMutationPayload",
    "kind": "LinkedField",
    "name": "confirm",
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
    "name": "authConfirmUserEmailMutation",
    "selections": (v1/*: any*/),
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "authConfirmUserEmailMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "22e8cafb1074c151860f1fa029c9d889",
    "id": null,
    "metadata": {},
    "name": "authConfirmUserEmailMutation",
    "operationKind": "mutation",
    "text": "mutation authConfirmUserEmailMutation(\n  $input: ConfirmEmailMutationInput!\n) {\n  confirm(input: $input) {\n    ok\n  }\n}\n"
  }
};
})();

(node as any).hash = "6fac6051007c1f4e0a3d7ba92afeb901";

export default node;
