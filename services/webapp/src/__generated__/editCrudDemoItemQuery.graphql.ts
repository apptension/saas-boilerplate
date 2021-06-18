/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type editCrudDemoItemQueryVariables = {
    id: string;
};
export type editCrudDemoItemQueryResponse = {
    readonly crudDemoItem: {
        readonly id: string;
        readonly name: string;
    } | null;
};
export type editCrudDemoItemQuery = {
    readonly response: editCrudDemoItemQueryResponse;
    readonly variables: editCrudDemoItemQueryVariables;
};



/*
query editCrudDemoItemQuery(
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
    "name": "editCrudDemoItemQuery",
    "selections": (v1/*: any*/),
    "type": "ApiQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editCrudDemoItemQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f4c769592650c0f50cde27bb29e2613b",
    "id": null,
    "metadata": {},
    "name": "editCrudDemoItemQuery",
    "operationKind": "query",
    "text": "query editCrudDemoItemQuery(\n  $id: ID!\n) {\n  crudDemoItem(id: $id) {\n    id\n    name\n  }\n}\n"
  }
};
})();
(node as any).hash = 'b4cc674573b614b13d9c5d41343b3384';
export default node;
