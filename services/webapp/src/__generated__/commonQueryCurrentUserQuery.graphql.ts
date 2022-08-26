/**
 * @generated SignedSource<<20c18d204ad6f428bbdaa604e2b38487>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type commonQueryCurrentUserQuery$variables = {};
export type commonQueryCurrentUserQuery$data = {
  readonly currentUser: {
    readonly avatar: string | null;
    readonly email: string;
    readonly firstName: string | null;
    readonly id: string;
    readonly lastName: string | null;
    readonly roles: ReadonlyArray<string | null> | null;
  } | null;
};
export type commonQueryCurrentUserQuery = {
  response: commonQueryCurrentUserQuery$data;
  variables: commonQueryCurrentUserQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "CurrentUserType",
    "kind": "LinkedField",
    "name": "currentUser",
    "plural": false,
    "selections": [
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
        "name": "email",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "firstName",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "lastName",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "roles",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "avatar",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "commonQueryCurrentUserQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "commonQueryCurrentUserQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "16a64836802703f64d0dcdf0cca5c29f",
    "id": null,
    "metadata": {},
    "name": "commonQueryCurrentUserQuery",
    "operationKind": "query",
    "text": "query commonQueryCurrentUserQuery {\n  currentUser {\n    id\n    email\n    firstName\n    lastName\n    roles\n    avatar\n  }\n}\n"
  }
};
})();

(node as any).hash = "0c2bc5b22cbfed22893e287bd4d6dae6";

export default node;
