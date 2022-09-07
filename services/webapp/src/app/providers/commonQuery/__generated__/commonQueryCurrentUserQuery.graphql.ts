/**
 * @generated SignedSource<<d55cea183205c1824db1ce89bc0774d9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type commonQueryCurrentUserQuery$variables = {};
export type commonQueryCurrentUserQuery$data = {
  readonly currentUser: {
    readonly " $fragmentSpreads": FragmentRefs<"commonQueryCurrentUserFragment">;
  } | null;
};
export type commonQueryCurrentUserQuery = {
  response: commonQueryCurrentUserQuery$data;
  variables: commonQueryCurrentUserQuery$variables;
};

const node: ConcreteRequest = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "commonQueryCurrentUserQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "CurrentUserType",
        "kind": "LinkedField",
        "name": "currentUser",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "commonQueryCurrentUserFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "commonQueryCurrentUserQuery",
    "selections": [
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
    ]
  },
  "params": {
    "cacheID": "7d0794a029f49f79068c3f2d9c7171e9",
    "id": null,
    "metadata": {},
    "name": "commonQueryCurrentUserQuery",
    "operationKind": "query",
    "text": "query commonQueryCurrentUserQuery {\n  currentUser {\n    ...commonQueryCurrentUserFragment\n    id\n  }\n}\n\nfragment commonQueryCurrentUserFragment on CurrentUserType {\n  id\n  email\n  firstName\n  lastName\n  roles\n  avatar\n}\n"
  }
};

(node as any).hash = "1d0f232aa3aa6fe00741fed90e42fde8";

export default node;
