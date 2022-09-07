/**
 * @generated SignedSource<<85ab1500fa30520b45fe63f932ca5e60>>
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
  "name": "__typename",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v4 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v5 = {
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
        "alias": "allContentfulDemoItemFavorites",
        "args": null,
        "concreteType": "ContentfulDemoItemFavoriteConnection",
        "kind": "LinkedField",
        "name": "__useFavoriteDemoItemListQuery__allContentfulDemoItemFavorites_connection",
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
                  },
                  (v1/*: any*/)
                ],
                "storageKey": null
              },
              (v2/*: any*/)
            ],
            "storageKey": null
          },
          (v3/*: any*/)
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
        "args": (v4/*: any*/),
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
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v5/*: any*/),
                  (v1/*: any*/)
                ],
                "storageKey": null
              },
              (v2/*: any*/)
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": "allContentfulDemoItemFavorites(first:100)"
      },
      {
        "alias": null,
        "args": (v4/*: any*/),
        "filters": null,
        "handle": "connection",
        "key": "useFavoriteDemoItemListQuery__allContentfulDemoItemFavorites",
        "kind": "LinkedHandle",
        "name": "allContentfulDemoItemFavorites"
      }
    ]
  },
  "params": {
    "cacheID": "d2188111eeaf65b40eea64dd1e84db41",
    "id": null,
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "allContentfulDemoItemFavorites"
          ]
        }
      ]
    },
    "name": "useFavoriteDemoItemListQuery",
    "operationKind": "query",
    "text": "query useFavoriteDemoItemListQuery {\n  allContentfulDemoItemFavorites(first: 100) {\n    edges {\n      node {\n        item {\n          pk\n          id\n        }\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bf29a723637467fa03a4b98bca27c039";

export default node;
