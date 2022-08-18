/**
 * @generated SignedSource<<61f574ad7b6e819ae1e87d551c56f1bd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type useFavoriteDemoItemListQuery$variables = {};
export type useFavoriteDemoItemListQuery$data = {
  readonly allContentfulDemoItemFavorites: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly item: {
          readonly pk: string | null;
        };
      } | null;
    } | null>;
  } | null;
};
export type useFavoriteDemoItemListQuery = {
  response: useFavoriteDemoItemListQuery$data;
  variables: useFavoriteDemoItemListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pk",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useFavoriteDemoItemListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ContentfulDemoItemFavoriteConnection",
        "kind": "LinkedField",
        "name": "allContentfulDemoItemFavorites",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContentfulDemoItemFavoriteEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ContentfulDemoItemFavoriteType",
                "kind": "LinkedField",
                "name": "node",
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
                      (v0/*: any*/)
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
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useFavoriteDemoItemListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ContentfulDemoItemFavoriteConnection",
        "kind": "LinkedField",
        "name": "allContentfulDemoItemFavorites",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContentfulDemoItemFavoriteEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ContentfulDemoItemFavoriteType",
                "kind": "LinkedField",
                "name": "node",
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
                      (v0/*: any*/),
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v1/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b476d0430a4748a39705a4f834a0def8",
    "id": null,
    "metadata": {},
    "name": "useFavoriteDemoItemListQuery",
    "operationKind": "query",
    "text": "query useFavoriteDemoItemListQuery {\n  allContentfulDemoItemFavorites {\n    edges {\n      node {\n        item {\n          pk\n          id\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "39020539f94f81ea812e3f9880c839c0";

export default node;
