/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type crudDemoItemDetailsQueryVariables = {
    id: string;
};
export type crudDemoItemDetailsQueryResponse = {
    readonly crudDemoItem: {
        readonly id: string;
        readonly name: string;
    } | null;
};
export type crudDemoItemDetailsQuery = {
    readonly response: crudDemoItemDetailsQueryResponse;
    readonly variables: crudDemoItemDetailsQueryVariables;
};



/*
query crudDemoItemDetailsQuery(
  $id: ID!
) {
  crudDemoItem(id: $id) {
    id
    name
  }
}
*/

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
    "type": "ApiQuery",
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
(node as any).hash = '3405ece059e5a6e86e48f7e6266c67c6';
export default node;
