/**
 * @generated SignedSource<<583b476b81d11a17a2e13902b378be38>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type documentListItemStoryQuery$variables = {};
export type documentListItemStoryQuery$data = {
  readonly allDocumentDemoItems: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"documentListItem">;
      } | null;
    } | null>;
  } | null;
};
export type documentListItemStoryQuery = {
  response: documentListItemStoryQuery$data;
  variables: documentListItemStoryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v1 = {
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
    "name": "documentListItemStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "DocumentDemoItemConnection",
        "kind": "LinkedField",
        "name": "allDocumentDemoItems",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DocumentDemoItemEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DocumentDemoItemType",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "documentListItem"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "allDocumentDemoItems(first:1)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentListItemStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "DocumentDemoItemConnection",
        "kind": "LinkedField",
        "name": "allDocumentDemoItems",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DocumentDemoItemEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DocumentDemoItemType",
                "kind": "LinkedField",
                "name": "node",
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
                    "concreteType": "FileFieldType",
                    "kind": "LinkedField",
                    "name": "file",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "url",
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
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "createdAt",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "allDocumentDemoItems(first:1)"
      }
    ]
  },
  "params": {
    "cacheID": "5d876d3090a217491aaa4588217ba022",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "allDocumentDemoItems": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DocumentDemoItemConnection"
        },
        "allDocumentDemoItems.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "DocumentDemoItemEdge"
        },
        "allDocumentDemoItems.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DocumentDemoItemType"
        },
        "allDocumentDemoItems.edges.node.createdAt": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "allDocumentDemoItems.edges.node.file": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "FileFieldType"
        },
        "allDocumentDemoItems.edges.node.file.name": (v1/*: any*/),
        "allDocumentDemoItems.edges.node.file.url": (v1/*: any*/),
        "allDocumentDemoItems.edges.node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        }
      }
    },
    "name": "documentListItemStoryQuery",
    "operationKind": "query",
    "text": "query documentListItemStoryQuery {\n  allDocumentDemoItems(first: 1) {\n    edges {\n      node {\n        ...documentListItem\n        id\n      }\n    }\n  }\n}\n\nfragment documentListItem on DocumentDemoItemType {\n  id\n  file {\n    url\n    name\n  }\n  createdAt\n}\n"
  }
};
})();

(node as any).hash = "e2cb1808bcc2e287cbb414832638394e";

export default node;
