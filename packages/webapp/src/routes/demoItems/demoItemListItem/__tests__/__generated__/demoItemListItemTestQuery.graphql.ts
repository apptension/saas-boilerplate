/**
 * @generated SignedSource<<1cd6fdb24e00836ac9120452b33597f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type demoItemListItemTestQuery$variables = {};
export type demoItemListItemTestQuery$data = {
  readonly testItem: {
    readonly " $fragmentSpreads": FragmentRefs<"demoItemListItem_item">;
  } | null;
};
export type demoItemListItemTestQuery = {
  response: demoItemListItemTestQuery$data;
  variables: demoItemListItemTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "contentful-item-1"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v2 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "demoItemListItemTestQuery",
    "selections": [
      {
        "alias": "testItem",
        "args": (v0/*: any*/),
        "concreteType": "DemoItem",
        "kind": "LinkedField",
        "name": "demoItem",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "demoItemListItem_item"
          }
        ],
        "storageKey": "demoItem(id:\"contentful-item-1\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "demoItemListItemTestQuery",
    "selections": [
      {
        "alias": "testItem",
        "args": (v0/*: any*/),
        "concreteType": "DemoItem",
        "kind": "LinkedField",
        "name": "demoItem",
        "plural": false,
        "selections": [
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
        "storageKey": "demoItem(id:\"contentful-item-1\")"
      }
    ]
  },
  "params": {
    "cacheID": "cad66189f5756860c1c15152587771b8",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "testItem": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DemoItem"
        },
        "testItem.image": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Asset"
        },
        "testItem.image.title": (v2/*: any*/),
        "testItem.image.url": (v2/*: any*/),
        "testItem.title": (v2/*: any*/)
      }
    },
    "name": "demoItemListItemTestQuery",
    "operationKind": "query",
    "text": "query demoItemListItemTestQuery {\n  testItem: demoItem(id: \"contentful-item-1\") {\n    ...demoItemListItem_item\n  }\n}\n\nfragment demoItemListItem_item on DemoItem {\n  title\n  image {\n    title\n    url\n  }\n}\n"
  }
};
})();

(node as any).hash = "bbd4ba26c34d42d197c8d1c03ef69b26";

export default node;
