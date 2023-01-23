/**
 * @generated SignedSource<<7c09af3eb8c27556cdcfdb8830ccf6f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type crudDemoItemListItemTestQuery$variables = {};
export type crudDemoItemListItemTestQuery$data = {
  readonly item: {
    readonly " $fragmentSpreads": FragmentRefs<"crudDemoItemListItem">;
  } | null;
};
export type crudDemoItemListItemTestQuery = {
  response: crudDemoItemListItemTestQuery$data;
  variables: crudDemoItemListItemTestQuery$variables;
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
    "name": "crudDemoItemListItemTestQuery",
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
    "name": "crudDemoItemListItemTestQuery",
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
    "cacheID": "5373f40b3e057225d0ae42cba75cb8c1",
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
    "text": "query crudDemoItemListItemTestQuery {\n  item: crudDemoItem(id: \"test-id\") {\n    ...crudDemoItemListItem\n    id\n  }\n}\n\nfragment crudDemoItemListItem on CrudDemoItemType {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "3777869b4ab394a1433393090f79a518";

export default node;
