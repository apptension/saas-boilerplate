/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type DeleteDocumentDemoItemMutationInput = {
    id?: string | null;
    clientMutationId?: string | null;
};
export type documentsDeleteMutationVariables = {
    input: DeleteDocumentDemoItemMutationInput;
    connections: Array<string>;
};
export type documentsDeleteMutationResponse = {
    readonly deleteDocumentDemoItem: {
        readonly deletedIds: ReadonlyArray<string | null> | null;
    } | null;
};
export type documentsDeleteMutation = {
    readonly response: documentsDeleteMutationResponse;
    readonly variables: documentsDeleteMutationVariables;
};



/*
mutation documentsDeleteMutation(
  $input: DeleteDocumentDemoItemMutationInput!
) {
  deleteDocumentDemoItem(input: $input) {
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
    "name": "documentsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteDocumentDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "deleteDocumentDemoItem",
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
    "name": "documentsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteDocumentDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "deleteDocumentDemoItem",
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
    "cacheID": "31cf0bad1464268ef722d96746b34f92",
    "id": null,
    "metadata": {},
    "name": "documentsDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDeleteMutation(\n  $input: DeleteDocumentDemoItemMutationInput!\n) {\n  deleteDocumentDemoItem(input: $input) {\n    deletedIds\n  }\n}\n"
  }
};
})();
(node as any).hash = '64b1e5c621b87af05d96dd2e185f9fe5';
export default node;
