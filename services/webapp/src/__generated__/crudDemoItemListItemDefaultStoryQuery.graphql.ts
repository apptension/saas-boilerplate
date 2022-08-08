/**
 * @generated SignedSource<<cf6f594ce80062b822c3f907d3263a1f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type crudDemoItemListItemDefaultStoryQuery$variables = {};
export type crudDemoItemListItemDefaultStoryQuery$data = {
  readonly item: {
    readonly " $fragmentSpreads": FragmentRefs<"crudDemoItemListItem">;
  } | null;
};
export type crudDemoItemListItemDefaultStoryQuery = {
  response: crudDemoItemListItemDefaultStoryQuery$data;
  variables: crudDemoItemListItemDefaultStoryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "crudDemoItemListItemDefaultStoryQuery",
    "selections": [
      {
        "alias": "item",
        "args": (v0/*: any*/),
        "concreteType": "CrudDemoItemType",
        "kind": "LinkedField",
        "name": "crudDemoItem",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "crudDemoItemListItem"
          }
        ],
        "storageKey": "crudDemoItem(id:\"test-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "crudDemoItemListItemDefaultStoryQuery",
    "selections": [
      {
        "alias": "item",
        "args": (v0/*: any*/),
        "concreteType": "CrudDemoItemType",
        "kind": "LinkedField",
        "name": "crudDemoItem",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": "crudDemoItem(id:\"test-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "5791ce71acc374ae69ea6933377ab2ec",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "item": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "CrudDemoItemType"
        },
        "item.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "item.name": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "crudDemoItemListItemDefaultStoryQuery",
    "operationKind": "query",
    "text": "query crudDemoItemListItemDefaultStoryQuery {\n  item: crudDemoItem(id: \"test-id\") {\n    ...crudDemoItemListItem\n    id\n  }\n}\n\nfragment crudDemoItemListItem on CrudDemoItemType {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "383d77c869152b2312739b3f0affaac2";

export default node;
