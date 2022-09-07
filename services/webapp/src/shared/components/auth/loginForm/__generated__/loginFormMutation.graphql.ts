/**
 * @generated SignedSource<<c6305fb7f123fab1a608908a9febaabb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ObtainTokenMutationInput = {
  clientMutationId?: string | null;
  email: string;
  password: string;
};
export type loginFormMutation$variables = {
  input: ObtainTokenMutationInput;
};
export type loginFormMutation$data = {
  readonly tokenAuth: {
    readonly access: string | null;
    readonly refresh: string | null;
  } | null;
};
export type loginFormMutation = {
  response: loginFormMutation$data;
  variables: loginFormMutation$variables;
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
    "concreteType": "ObtainTokenMutationPayload",
    "kind": "LinkedField",
    "name": "tokenAuth",
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
    "name": "loginFormMutation",
    "selections": (v1/*: any*/),
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "loginFormMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6c720dc80644e5f165f12212b538042c",
    "id": null,
    "metadata": {},
    "name": "loginFormMutation",
    "operationKind": "mutation",
    "text": "mutation loginFormMutation(\n  $input: ObtainTokenMutationInput!\n) {\n  tokenAuth(input: $input) {\n    access\n    refresh\n  }\n}\n"
  }
};
})();

(node as any).hash = "9747f0626cb1b58b831472e73b4060ae";

export default node;
