/**
 * @generated SignedSource<<f9c3cdf202752b4287478a680a3f515b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateFavoriteContentfulDemoItemMutationInput = {
  clientMutationId?: string | null;
  item: string;
  user?: string | null;
};
export type useFavoriteDemoItemListCreateMutation$variables = {
  input: CreateFavoriteContentfulDemoItemMutationInput;
};
export type useFavoriteDemoItemListCreateMutation$data = {
  readonly createFavoriteContentfulDemoItem: {
    readonly contentfulDemoItemFavorite: {
      readonly item: {
        readonly pk: string | null;
      };
    } | null;
  } | null;
};
export type useFavoriteDemoItemListCreateMutation = {
  response: useFavoriteDemoItemListCreateMutation$data;
  variables: useFavoriteDemoItemListCreateMutation$variables;
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pk",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useFavoriteDemoItemListCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateFavoriteContentfulDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "createFavoriteContentfulDemoItem",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContentfulDemoItemFavoriteType",
            "kind": "LinkedField",
            "name": "contentfulDemoItemFavorite",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ContentfulDemoItemType",
                "kind": "LinkedField",
                "name": "item",
                "plural": false,
                "selections": [
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useFavoriteDemoItemListCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateFavoriteContentfulDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "createFavoriteContentfulDemoItem",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContentfulDemoItemFavoriteType",
            "kind": "LinkedField",
            "name": "contentfulDemoItemFavorite",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ContentfulDemoItemType",
                "kind": "LinkedField",
                "name": "item",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5e31795e48529982d59c677b6334a2b7",
    "id": null,
    "metadata": {},
    "name": "useFavoriteDemoItemListCreateMutation",
    "operationKind": "mutation",
    "text": "mutation useFavoriteDemoItemListCreateMutation(\n  $input: CreateFavoriteContentfulDemoItemMutationInput!\n) {\n  createFavoriteContentfulDemoItem(input: $input) {\n    contentfulDemoItemFavorite {\n      item {\n        pk\n        id\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "65a9863a6d52cd7cb0bae520a4f64ed4";

export default node;
