/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type editCrudDemoItemQueryVariables = {
    id: string;
};
export type editCrudDemoItemQueryResponse = {
    readonly crudDemoItemById: {
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
    "cacheID": "335a69886e1dbe868250f5765bc05f36",
    "id": null,
    "metadata": {},
    "name": "editCrudDemoItemQuery",
    "operationKind": "query",
    "text": "query editCrudDemoItemQuery(\n  $id: String!\n) {\n  crudDemoItemById(id: $id) {\n    id\n    name\n  }\n}\n"
  }
};
})();
(node as any).hash = '4e064bb97e85535d1f4cec0862016117';
export default node;
