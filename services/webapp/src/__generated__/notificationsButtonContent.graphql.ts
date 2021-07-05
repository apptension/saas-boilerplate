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
  "metadata": null,
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
(node as any).hash = 'f339f8afc72f8403798b2e0e368e8e60';
export default node;
