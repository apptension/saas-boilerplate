/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type crudDemoItemDetailsQueryVariables = {
    id: string;
};
export type crudDemoItemDetailsQueryResponse = {
    readonly crudDemoItemById: {
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
  $id: String!
) {
  crudDemoItemById(id: $id) {
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
    "name": "crudDemoItemById",
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
    "cacheID": "38db67955ce4a13f67f0cef4c63ce92d",
    "id": null,
    "metadata": {},
    "name": "crudDemoItemDetailsQuery",
    "operationKind": "query",
    "text": "query crudDemoItemDetailsQuery(\n  $id: String!\n) {\n  crudDemoItemById(id: $id) {\n    id\n    name\n  }\n}\n"
  }
};
})();
(node as any).hash = '1371d2aec8e41ca35cd2cc6faa5ea808';
export default node;
