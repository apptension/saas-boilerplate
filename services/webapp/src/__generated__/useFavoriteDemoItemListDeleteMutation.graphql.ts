/**
 * @generated SignedSource<<46e4472c03569f2b25442c51c41cd88f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeleteFavoriteContentfulDemoItemMutationInput = {
  clientMutationId?: string | null;
  item?: string | null;
};
export type useFavoriteDemoItemListDeleteMutation$variables = {
  connections: ReadonlyArray<string>;
  input: DeleteFavoriteContentfulDemoItemMutationInput;
};
export type useFavoriteDemoItemListDeleteMutation$data = {
  readonly deleteFavoriteContentfulDemoItem: {
    readonly deletedIds: ReadonlyArray<string | null> | null;
  } | null;
};
export type useFavoriteDemoItemListDeleteMutation = {
  response: useFavoriteDemoItemListDeleteMutation$data;
  variables: useFavoriteDemoItemListDeleteMutation$variables;
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
    "name": "useFavoriteDemoItemListDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteFavoriteContentfulDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "deleteFavoriteContentfulDemoItem",
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
    "name": "useFavoriteDemoItemListDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteFavoriteContentfulDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "deleteFavoriteContentfulDemoItem",
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
    "cacheID": "02425ee75388bc01e074f620291bba67",
    "id": null,
    "metadata": {},
    "name": "useFavoriteDemoItemListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation useFavoriteDemoItemListDeleteMutation(\n  $input: DeleteFavoriteContentfulDemoItemMutationInput!\n) {\n  deleteFavoriteContentfulDemoItem(input: $input) {\n    deletedIds\n  }\n}\n"
  }
};
})();

(node as any).hash = "e6262bfe08fadf4d4a888dc51694baa0";

export default node;
