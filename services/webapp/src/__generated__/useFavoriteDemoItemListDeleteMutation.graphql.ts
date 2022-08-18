/**
 * @generated SignedSource<<838f57aab2dd6b9decda90c827f95b03>>
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
    "concreteType": "DeleteFavoriteContentfulDemoItemMutationPayload",
    "kind": "LinkedField",
    "name": "deleteFavoriteContentfulDemoItem",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deletedIds",
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
    "name": "useFavoriteDemoItemListDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useFavoriteDemoItemListDeleteMutation",
    "selections": (v1/*: any*/)
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

(node as any).hash = "db83416f7f80115d24f408f0aa4578b2";

export default node;
