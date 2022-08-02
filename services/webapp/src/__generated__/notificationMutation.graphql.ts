/**
 * @generated SignedSource<<c60e71d8fdc6a24921f522eae5f890ad>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UpdateNotificationMutationInput = {
  clientMutationId?: string | null;
  id: string;
  isRead?: boolean | null;
};
export type notificationMutation$variables = {
  input: UpdateNotificationMutationInput;
};
export type notificationMutation$data = {
  readonly updateNotification: {
    readonly hasUnreadNotifications: boolean | null;
    readonly notificationEdge: {
      readonly node: {
        readonly readAt: String | null;
      } | null;
    } | null;
  } | null;
};
export type notificationMutation = {
  response: notificationMutation$data;
  variables: notificationMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "hasUnreadNotifications",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "readAt",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "notificationMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateNotificationMutationPayload",
        "kind": "LinkedField",
        "name": "updateNotification",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationEdge",
            "kind": "LinkedField",
            "name": "notificationEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationType",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "notificationMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateNotificationMutationPayload",
        "kind": "LinkedField",
        "name": "updateNotification",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationEdge",
            "kind": "LinkedField",
            "name": "notificationEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationType",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
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
    "cacheID": "8981da65b915941349d8e909f28a214b",
    "id": null,
    "metadata": {},
    "name": "notificationMutation",
    "operationKind": "mutation",
    "text": "mutation notificationMutation(\n  $input: UpdateNotificationMutationInput!\n) {\n  updateNotification(input: $input) {\n    hasUnreadNotifications\n    notificationEdge {\n      node {\n        readAt\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5cd9ac2d454a94770adf70d7155377cd";

export default node;
