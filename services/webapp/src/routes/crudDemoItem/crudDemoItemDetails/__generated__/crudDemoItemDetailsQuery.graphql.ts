/**
 * @generated SignedSource<<25cfc2d5f6b8d1acb0ba7cae0913ef30>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type crudDemoItemDetailsQuery$variables = {
  id: string;
};
export type crudDemoItemDetailsQuery$data = {
  readonly crudDemoItem: {
    readonly id: string;
    readonly name: string;
  } | null;
};
export type crudDemoItemDetailsQuery = {
  response: crudDemoItemDetailsQuery$data;
  variables: crudDemoItemDetailsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "CrudDemoItemType",
    "kind": "LinkedField",
    "name": "crudDemoItem",
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
        "name": "name",
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
    "name": "crudDemoItemDetailsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "crudDemoItemDetailsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ae191ada4a6e4ec5a783fad514cd082a",
    "id": null,
    "metadata": {},
    "name": "crudDemoItemDetailsQuery",
    "operationKind": "query",
    "text": "query crudDemoItemDetailsQuery(\n  $id: ID!\n) {\n  crudDemoItem(id: $id) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "3405ece059e5a6e86e48f7e6266c67c6";

export default node;
