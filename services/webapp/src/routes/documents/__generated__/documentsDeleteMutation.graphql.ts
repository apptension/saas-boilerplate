/**
 * @generated SignedSource<<00da567d7de0939342d82d7f728f03fa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeleteDocumentDemoItemMutationInput = {
  clientMutationId?: string | null;
  id?: string | null;
};
export type documentsDeleteMutation$variables = {
  connections: ReadonlyArray<string>;
  input: DeleteDocumentDemoItemMutationInput;
};
export type documentsDeleteMutation$data = {
  readonly deleteDocumentDemoItem: {
    readonly deletedIds: ReadonlyArray<string | null> | null;
  } | null;
};
export type documentsDeleteMutation = {
  response: documentsDeleteMutation$data;
  variables: documentsDeleteMutation$variables;
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

(node as any).hash = "64b1e5c621b87af05d96dd2e185f9fe5";

export default node;
