/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type CreateOrUpdateCrudDemoItemMutationInput = {
    id?: string | null;
    name: string;
    clientMutationId?: string | null;
};
export type editCrudDemoItemContentMutationVariables = {
    input: CreateOrUpdateCrudDemoItemMutationInput;
};
export type editCrudDemoItemContentMutationResponse = {
    readonly createOrUpdateCrudDemoItem: {
        readonly crudDemoItem: {
            readonly id: string;
            readonly name: string;
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
export type editCrudDemoItemContentMutation = {
    readonly response: editCrudDemoItemContentMutationResponse;
    readonly variables: editCrudDemoItemContentMutationVariables;
};



/*
mutation editCrudDemoItemContentMutation(
  $input: CreateOrUpdateCrudDemoItemMutationInput!
) {
  createOrUpdateCrudDemoItem(input: $input) {
    crudDemoItem {
      id
      name
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
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateOrUpdateCrudDemoItemMutationPayload",
    "kind": "LinkedField",
    "name": "createOrUpdateCrudDemoItem",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
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
      },
      {
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
    "name": "editCrudDemoItemContentMutation",
    "selections": (v1/*: any*/),
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editCrudDemoItemContentMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "019a078a35b8dc36977a45db2a794527",
    "id": null,
    "metadata": {},
    "name": "editCrudDemoItemContentMutation",
    "operationKind": "mutation",
    "text": "mutation editCrudDemoItemContentMutation(\n  $input: CreateOrUpdateCrudDemoItemMutationInput!\n) {\n  createOrUpdateCrudDemoItem(input: $input) {\n    crudDemoItem {\n      id\n      name\n    }\n    errors {\n      field\n      messages {\n        code\n        message\n      }\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '94ac86a4fa022bb6da3ba1c8394c9895';
export default node;
