/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type DeleteCrudDemoItemMutationInput = {
    id?: string | null;
    clientMutationId?: string | null;
};
export type crudDropdownMenuItemDeleteMutationVariables = {
    input: DeleteCrudDemoItemMutationInput;
    connections: Array<string>;
};
export type crudDropdownMenuItemDeleteMutationResponse = {
    readonly deleteCrudDemoItem: {
        readonly deletedIds: ReadonlyArray<string | null> | null;
    } | null;
};
export type crudDropdownMenuItemDeleteMutation = {
    readonly response: crudDropdownMenuItemDeleteMutationResponse;
    readonly variables: crudDropdownMenuItemDeleteMutationVariables;
};



/*
mutation crudDropdownMenuItemDeleteMutation(
  $input: DeleteCrudDemoItemMutationInput!
) {
  deleteCrudDemoItem(input: $input) {
    deletedIds
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
  "kind": "ScalarField",
  "name": "deletedIds",
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
    "name": "crudDropdownMenuItemDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteCrudDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "deleteCrudDemoItem",
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
    "name": "crudDropdownMenuItemDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteCrudDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "deleteCrudDemoItem",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteEdge",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedIds",
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
    "cacheID": "a9fe5ea51337fc955a2685f1ff2601f2",
    "id": null,
    "metadata": {},
    "name": "crudDropdownMenuItemDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation crudDropdownMenuItemDeleteMutation(\n  $input: DeleteCrudDemoItemMutationInput!\n) {\n  deleteCrudDemoItem(input: $input) {\n    deletedIds\n  }\n}\n"
  }
};
})();
(node as any).hash = 'bf0cf0c805b0aa2362d9e0e897296bcc';
export default node;
