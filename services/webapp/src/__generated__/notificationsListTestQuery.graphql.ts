/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type notificationsListTestQueryVariables = {};
export type notificationsListTestQueryResponse = {
    readonly " $fragmentRefs": FragmentRefs<"notificationsListContent">;
};
export type notificationsListTestQuery = {
    readonly response: notificationsListTestQueryResponse;
    readonly variables: notificationsListTestQueryVariables;
};



/*
query notificationsListTestQuery {
  ...notificationsListContent
}

fragment notificationsListContent on ApiQuery {
  allNotifications(first: 20) {
    edges {
      node {
        id
        data
        createdAt
        readAt
        type
        __typename
      }
      cursor
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v1 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
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
    "name": "notificationsListTestQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "notificationsListContent"
      }
    ],
    "type": "ApiQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "notificationsListTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "NotificationConnection",
        "kind": "LinkedField",
        "name": "allNotifications",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationType",
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
                    "kind": "ScalarField",
                    "name": "data",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "createdAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "readAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cursor",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
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
                "name": "startCursor",
                "storageKey": null
              },
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
          }
        ],
        "storageKey": "allNotifications(first:20)"
      },
      {
        "alias": null,
        "args": (v0/*: any*/),
        "filters": null,
        "handle": "connection",
        "key": "notificationsList_allNotifications",
        "kind": "LinkedHandle",
        "name": "allNotifications"
      }
    ]
  },
  "params": {
    "cacheID": "f425bce97884b88a762766b1f48e6ba6",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "allNotifications": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "NotificationConnection"
        },
        "allNotifications.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "NotificationEdge"
        },
        "allNotifications.edges.cursor": (v1/*: any*/),
        "allNotifications.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "NotificationType"
        },
        "allNotifications.edges.node.__typename": (v1/*: any*/),
        "allNotifications.edges.node.createdAt": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "allNotifications.edges.node.data": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "GenericScalar"
        },
        "allNotifications.edges.node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "allNotifications.edges.node.readAt": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DateTime"
        },
        "allNotifications.edges.node.type": (v1/*: any*/),
        "allNotifications.pageInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PageInfo"
        },
        "allNotifications.pageInfo.endCursor": (v2/*: any*/),
        "allNotifications.pageInfo.hasNextPage": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Boolean"
        },
        "allNotifications.pageInfo.startCursor": (v2/*: any*/)
      }
    },
    "name": "notificationsListTestQuery",
    "operationKind": "query",
    "text": "query notificationsListTestQuery {\n  ...notificationsListContent\n}\n\nfragment notificationsListContent on ApiQuery {\n  allNotifications(first: 20) {\n    edges {\n      node {\n        id\n        data\n        createdAt\n        readAt\n        type\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      startCursor\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '78955f8e6235da6df19882fa738be89d';
export default node;
