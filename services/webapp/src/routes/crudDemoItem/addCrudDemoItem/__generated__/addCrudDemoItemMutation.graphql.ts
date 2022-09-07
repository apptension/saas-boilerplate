/**
 * @generated SignedSource<<bed7e87ef10d551db064bd8829638397>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateCrudDemoItemMutationInput = {
  clientMutationId?: string | null;
  createdBy?: string | null;
  name: string;
};
export type addCrudDemoItemMutation$variables = {
  connections: ReadonlyArray<string>;
  input: CreateCrudDemoItemMutationInput;
};
export type addCrudDemoItemMutation$data = {
  readonly createCrudDemoItem: {
    readonly crudDemoItemEdge: {
      readonly node: {
        readonly id: string;
        readonly name: string;
      } | null;
    } | null;
  } | null;
};
export type addCrudDemoItemMutation = {
  response: addCrudDemoItemMutation$data;
  variables: addCrudDemoItemMutation$variables;
};

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
        "concreteType": "CreateCrudDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "createCrudDemoItem",
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
        "concreteType": "CreateCrudDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "createCrudDemoItem",
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
    "cacheID": "3b97ead646e9f8fd3ca62d6f9cdfcb4c",
    "id": null,
    "metadata": {},
    "name": "addCrudDemoItemMutation",
    "operationKind": "mutation",
    "text": "mutation addCrudDemoItemMutation(\n  $input: CreateCrudDemoItemMutationInput!\n) {\n  createCrudDemoItem(input: $input) {\n    crudDemoItemEdge {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d047d0d75ecf91d2e04460ba1737f41a";

export default node;
