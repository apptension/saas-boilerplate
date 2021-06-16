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
export type editCrudDemoItemContentMutationVariables = {
    input: CreateOrUpdateCrudDemoItemMutationInput;
};
export type editCrudDemoItemContentMutationResponse = {
    readonly createOrUpdateCrudDemoItem: {
        readonly crudDemoItem: {
            readonly id: string;
            readonly name: string;
        } | null;
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
    "cacheID": "6a59baf73cd51256c6972e2e5a9a4c3f",
    "id": null,
    "metadata": {},
    "name": "editCrudDemoItemContentMutation",
    "operationKind": "mutation",
    "text": "mutation editCrudDemoItemContentMutation(\n  $input: CreateOrUpdateCrudDemoItemMutationInput!\n) {\n  createOrUpdateCrudDemoItem(input: $input) {\n    crudDemoItem {\n      id\n      name\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'ee1f3ed5dd4b1c44d17dff1e47121734';
export default node;
