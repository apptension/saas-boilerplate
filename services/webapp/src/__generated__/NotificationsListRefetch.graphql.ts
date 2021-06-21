/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type NotificationsListRefetchVariables = {
    count?: number | null;
    cursor?: string | null;
};
export type NotificationsListRefetchResponse = {
    readonly " $fragmentRefs": FragmentRefs<"notificationsListContent">;
};
export type NotificationsListRefetch = {
    readonly response: NotificationsListRefetchResponse;
    readonly variables: NotificationsListRefetchVariables;
};



/*
query NotificationsListRefetch(
  $count: Int = 20
  $cursor: String
) {
  ...notificationsListContent_1G22uz
}

fragment notificationsListContent_1G22uz on ApiQuery {
  allNotifications(first: $count, after: $cursor) {
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
      endCursor
      hasNextPage
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": 20,
    "kind": "LocalArgument",
    "name": "count"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cursor"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationsListRefetch",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "count",
            "variableName": "count"
          },
          {
            "kind": "Variable",
            "name": "cursor",
            "variableName": "cursor"
          }
        ],
        "kind": "FragmentSpread",
        "name": "notificationsListContent"
      }
    ],
    "type": "ApiQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationsListRefetch",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "filters": null,
        "handle": "connection",
        "key": "notificationsList_allNotifications",
        "kind": "LinkedHandle",
        "name": "allNotifications"
      }
    ]
  },
  "params": {
    "cacheID": "f0cb84c4ef4725302b4130e6e2b9b8e2",
    "id": null,
    "metadata": {},
    "name": "NotificationsListRefetch",
    "operationKind": "query",
    "text": "query NotificationsListRefetch(\n  $count: Int = 20\n  $cursor: String\n) {\n  ...notificationsListContent_1G22uz\n}\n\nfragment notificationsListContent_1G22uz on ApiQuery {\n  allNotifications(first: $count, after: $cursor) {\n    edges {\n      node {\n        id\n        data\n        createdAt\n        readAt\n        type\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'd281c155bde568f581add801f9c869f1';
export default node;
