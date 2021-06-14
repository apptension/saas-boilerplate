/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type CreateOrUpdateCrudDemoItemMutationInput = {
    id?: string | null;
    name: string;
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
        readonly errors: ReadonlyArray<{
            readonly field: string;
            readonly messages: ReadonlyArray<{
                readonly code: string;
                readonly message: string;
            }> | null;
        } | null> | null;
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
    errors {
      field
      messages {
        code
        message
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
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "RelayErrorType",
  "kind": "LinkedField",
  "name": "errors",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "field",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "RelayErrorMessageType",
      "kind": "LinkedField",
      "name": "messages",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "code",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "message",
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
          (v3/*: any*/),
          (v4/*: any*/)
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
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9d87eeded51beaa30b58e4bfe95cb0e1",
    "id": null,
    "metadata": {},
    "name": "addCrudDemoItemMutation",
    "operationKind": "mutation",
    "text": "mutation addCrudDemoItemMutation(\n  $input: CreateOrUpdateCrudDemoItemMutationInput!\n) {\n  createOrUpdateCrudDemoItem(input: $input) {\n    crudDemoItemEdge {\n      node {\n        id\n        name\n      }\n    }\n    errors {\n      field\n      messages {\n        code\n        message\n      }\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '86e14fe0c74988898881f715a98f39b5';
export default node;
