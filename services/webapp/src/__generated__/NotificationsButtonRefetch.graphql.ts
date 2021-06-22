/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type NotificationsButtonRefetchVariables = {};
export type NotificationsButtonRefetchResponse = {
    readonly " $fragmentRefs": FragmentRefs<"notificationsButtonContent">;
};
export type NotificationsButtonRefetch = {
    readonly response: NotificationsButtonRefetchResponse;
    readonly variables: NotificationsButtonRefetchVariables;
};



/*
query NotificationsButtonRefetch {
  ...notificationsButtonContent
}

fragment notificationsButtonContent on ApiQuery {
  hasUnreadNotifications
}
*/

const node: ConcreteRequest = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationsButtonRefetch",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "notificationsButtonContent"
      }
    ],
    "type": "ApiQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "NotificationsButtonRefetch",
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "hasUnreadNotifications",
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c2505e0b30e0339792b2b58075f754f1",
    "id": null,
    "metadata": {},
    "name": "NotificationsButtonRefetch",
    "operationKind": "query",
    "text": "query NotificationsButtonRefetch {\n  ...notificationsButtonContent\n}\n\nfragment notificationsButtonContent on ApiQuery {\n  hasUnreadNotifications\n}\n"
  }
};
(node as any).hash = 'b26b7d704396597510f5c6f4a4fa9faf';
export default node;
