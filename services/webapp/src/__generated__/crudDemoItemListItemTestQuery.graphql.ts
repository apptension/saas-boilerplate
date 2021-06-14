/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type crudDemoItemListItemTestQueryVariables = {};
export type crudDemoItemListItemTestQueryResponse = {
    readonly item: {
        readonly " $fragmentRefs": FragmentRefs<"crudDemoItemListItem">;
    } | null;
};
export type crudDemoItemListItemTestQuery = {
    readonly response: crudDemoItemListItemTestQueryResponse;
    readonly variables: crudDemoItemListItemTestQueryVariables;
};



/*
query crudDemoItemListItemTestQuery {
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
    "name": "crudDemoItemListItemTestQuery",
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
    "name": "crudDemoItemListItemTestQuery",
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
    "cacheID": "6084c3313b49497698d0bb5601b10e99",
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
    "name": "crudDemoItemListItemTestQuery",
    "operationKind": "query",
    "text": "query crudDemoItemListItemTestQuery {\n  item: crudDemoItemById(id: \"test-id\") {\n    ...crudDemoItemListItem\n    id\n  }\n}\n\nfragment crudDemoItemListItem on CrudDemoItemType {\n  id\n  name\n}\n"
  }
};
})();
(node as any).hash = '8a58c3dcd1a02521384bd618c986c573';
export default node;
