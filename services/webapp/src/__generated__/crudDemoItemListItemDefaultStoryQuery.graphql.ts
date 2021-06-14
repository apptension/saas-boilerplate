/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type crudDemoItemListItemDefaultStoryQueryVariables = {};
export type crudDemoItemListItemDefaultStoryQueryResponse = {
    readonly item: {
        readonly " $fragmentRefs": FragmentRefs<"crudDemoItemListItem">;
    } | null;
};
export type crudDemoItemListItemDefaultStoryQuery = {
    readonly response: crudDemoItemListItemDefaultStoryQueryResponse;
    readonly variables: crudDemoItemListItemDefaultStoryQueryVariables;
};



/*
query crudDemoItemListItemDefaultStoryQuery {
  item: crudDemoItemById(id: "test-id") {
    ...crudDemoItemListItem
    id
  }
}

fragment crudDemoItemListItem on CrudDemoItemType {
  id
  name
}
*/

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
        "name": "crudDemoItemById",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "crudDemoItemListItem"
          }
        ],
        "storageKey": "crudDemoItemById(id:\"test-id\")"
      }
    ],
    "type": "ApiQuery",
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
        "name": "crudDemoItemById",
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
        "storageKey": "crudDemoItemById(id:\"test-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "8852ad9c9fb4e3534a62a47ef1d6d483",
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
    "text": "query crudDemoItemListItemDefaultStoryQuery {\n  item: crudDemoItemById(id: \"test-id\") {\n    ...crudDemoItemListItem\n    id\n  }\n}\n\nfragment crudDemoItemListItem on CrudDemoItemType {\n  id\n  name\n}\n"
  }
};
})();
(node as any).hash = '49bbac36db017d2459e39ea5e652c14e';
export default node;
