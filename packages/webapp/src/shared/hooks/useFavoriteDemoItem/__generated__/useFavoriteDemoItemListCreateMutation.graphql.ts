/**
 * @generated SignedSource<<d12251fbec4cb68af4a669d23fda3155>>
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
  connections: ReadonlyArray<string>;
  input: CreateFavoriteContentfulDemoItemMutationInput;
};
export type useFavoriteDemoItemListCreateMutation$data = {
  readonly createFavoriteContentfulDemoItem: {
    readonly contentfulDemoItemFavoriteEdge: {
      readonly node: {
        readonly item: {
          readonly pk: string | null;
        };
      } | null;
    } | null;
  } | null;
};
export type useFavoriteDemoItemListCreateMutation = {
  response: useFavoriteDemoItemListCreateMutation$data;
  variables: useFavoriteDemoItemListCreateMutation$variables;
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
  "name": "pk",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
    "name": "useFavoriteDemoItemListCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CreateFavoriteContentfulDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "createFavoriteContentfulDemoItem",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContentfulDemoItemFavoriteEdge",
            "kind": "LinkedField",
            "name": "contentfulDemoItemFavoriteEdge",
            "plural": false,
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
                      (v3/*: any*/)
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
    "name": "useFavoriteDemoItemListCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CreateFavoriteContentfulDemoItemMutationPayload",
        "kind": "LinkedField",
        "name": "createFavoriteContentfulDemoItem",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContentfulDemoItemFavoriteEdge",
            "kind": "LinkedField",
            "name": "contentfulDemoItemFavoriteEdge",
            "plural": false,
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
                      (v3/*: any*/),
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "appendEdge",
            "key": "",
            "kind": "LinkedHandle",
            "name": "contentfulDemoItemFavoriteEdge",
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
    "cacheID": "f73e8ce04d4da32d71c596e68259a83d",
    "id": null,
    "metadata": {},
    "name": "useFavoriteDemoItemListCreateMutation",
    "operationKind": "mutation",
    "text": "mutation useFavoriteDemoItemListCreateMutation(\n  $input: CreateFavoriteContentfulDemoItemMutationInput!\n) {\n  createFavoriteContentfulDemoItem(input: $input) {\n    contentfulDemoItemFavoriteEdge {\n      node {\n        item {\n          pk\n          id\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a2b13282df0765031f5c8bc4498cb10a";

export default node;
