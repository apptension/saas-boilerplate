/**
 * @generated SignedSource<<11cd7af237577cb4e72924cf83805a3f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
export type notificationsListSubscription$variables = {
  connections: ReadonlyArray<string>;
};
export type notificationsListSubscription$data = {
  readonly notificationCreated: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly createdAt: String;
        readonly data: any | null;
        readonly id: string;
        readonly readAt: String | null;
        readonly type: string;
      } | null;
    } | null>;
  } | null;
};
export type notificationsListSubscription = {
  response: notificationsListSubscription$data;
  variables: notificationsListSubscription$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "connections"
  }
],
v1 = {
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
          "name": "type",
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
          "name": "data",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "notificationsListSubscription",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "NotificationConnection",
        "kind": "LinkedField",
        "name": "notificationCreated",
        "plural": false,
        "selections": [
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "ApiSubscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "notificationsListSubscription",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "NotificationConnection",
        "kind": "LinkedField",
        "name": "notificationCreated",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "prependEdge",
            "key": "",
            "kind": "LinkedHandle",
            "name": "edges",
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
    "cacheID": "9af61424a23b697d49c9028aed95c6bc",
    "id": null,
    "metadata": {},
    "name": "notificationsListSubscription",
    "operationKind": "subscription",
    "text": "subscription notificationsListSubscription {\n  notificationCreated {\n    edges {\n      node {\n        id\n        type\n        createdAt\n        readAt\n        data\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "06eb3bc90a8b827867f2759d65c01d13";

export default node;
