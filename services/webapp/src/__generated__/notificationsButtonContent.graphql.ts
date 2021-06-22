/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type notificationsButtonContent = {
    readonly hasUnreadNotifications: boolean | null;
    readonly " $refType": "notificationsButtonContent";
};
export type notificationsButtonContent$data = notificationsButtonContent;
export type notificationsButtonContent$key = {
    readonly " $data"?: notificationsButtonContent$data;
    readonly " $fragmentRefs": FragmentRefs<"notificationsButtonContent">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [],
      "operation": require('./NotificationsButtonRefetch.graphql.ts')
    }
  },
  "name": "notificationsButtonContent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasUnreadNotifications",
      "storageKey": null
    }
  ],
  "type": "ApiQuery",
  "abstractKey": null
};
(node as any).hash = 'b26b7d704396597510f5c6f4a4fa9faf';
export default node;
