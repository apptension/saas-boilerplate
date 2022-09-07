/**
 * @generated SignedSource<<2a48b3d98068f5f92dd242f90f0e3bdc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type demoItemsAllQuery$variables = {};
export type demoItemsAllQuery$data = {
  readonly demoItemCollection: {
    readonly items: ReadonlyArray<{
      readonly sys: {
        readonly id: string;
      };
      readonly " $fragmentSpreads": FragmentRefs<"demoItemListItem_item">;
    } | null>;
  } | null;
};
export type demoItemsAllQuery = {
  response: demoItemsAllQuery$data;
  variables: demoItemsAllQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "concreteType": "Sys",
  "kind": "LinkedField",
  "name": "sys",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "demoItemsAllQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "DemoItemCollection",
        "kind": "LinkedField",
        "name": "demoItemCollection",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DemoItem",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v0/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "demoItemListItem_item"
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
    "name": "demoItemsAllQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "DemoItemCollection",
        "kind": "LinkedField",
        "name": "demoItemCollection",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DemoItem",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Asset",
                "kind": "LinkedField",
                "name": "image",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "url",
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
    ]
  },
  "params": {
    "cacheID": "91a1fb64c9eb710b28a1257983fbb7df",
    "id": null,
    "metadata": {},
    "name": "demoItemsAllQuery",
    "operationKind": "query",
    "text": "query demoItemsAllQuery {\n  demoItemCollection {\n    items {\n      sys {\n        id\n      }\n      ...demoItemListItem_item\n    }\n  }\n}\n\nfragment demoItemListItem_item on DemoItem {\n  title\n  image {\n    title\n    url\n  }\n}\n"
  }
};
})();

(node as any).hash = "d9cef872a59cb0f9307c7d0623cecce8";

export default node;
