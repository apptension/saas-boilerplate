/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type CreateOrUpdateCrudDemoItemMutationInput = {
    id?: string | null;
    name: string;
    user?: string | null;
    clientMutationId?: string | null;
};
export type addCrudDemoItemMutationVariables = {
    input: CreateOrUpdateCrudDemoItemMutationInput;
    connections: Array<string>;
};
export type addCrudDemoItemMutationResponse = {
    readonly createOrUpdateCrudDemoItem: {
        readonly crudDemoItemEdge: {
            readonly node: {
                readonly id: string;
                readonly name: string;
            } | null;
        } | null;
    } | null;
};
export type addCrudDemoItemMutation = {
    readonly response: addCrudDemoItemMutationResponse;
    readonly variables: addCrudDemoItemMutationVariables;
};



/*
mutation addCrudDemoItemMutation(
  $input: CreateOrUpdateCrudDemoItemMutationInput!
) {
  createOrUpdateCrudDemoItem(input: $input) {
    crudDemoItemEdge {
      node {
        id
        name
      }
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connections"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "CrudDemoItemEdge",
  "kind": "LinkedField",
  "name": "crudDemoItemEdge",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "CrudDemoItemType",
      "kind": "LinkedField",
      "name": "node",
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
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "addCrudDemoItemMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CreateOrUpdateCrudDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "createOrUpdateCrudDemoItem",
        "plural": false,
        "selections": [
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "addCrudDemoItemMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CreateOrUpdateCrudDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "createOrUpdateCrudDemoItem",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "appendEdge",
            "key": "",
            "kind": "LinkedHandle",
            "name": "crudDemoItemEdge",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "275c2f02e8847826204b181b44d32920",
    "id": null,
    "metadata": {},
    "name": "addCrudDemoItemMutation",
    "operationKind": "mutation",
    "text": "mutation addCrudDemoItemMutation(\n  $input: CreateOrUpdateCrudDemoItemMutationInput!\n) {\n  createOrUpdateCrudDemoItem(input: $input) {\n    crudDemoItemEdge {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'eac7c0be0dc2d1421d176702043a8145';
export default node;
