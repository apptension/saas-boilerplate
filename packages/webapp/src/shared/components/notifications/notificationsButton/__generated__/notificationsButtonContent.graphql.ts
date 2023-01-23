/**
 * @generated SignedSource<<e199427dd5e722dafe78f2e1f3d0d254>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type notificationsButtonContent$data = {
  readonly hasUnreadNotifications: boolean | null;
  readonly " $fragmentType": "notificationsButtonContent";
};
export type notificationsButtonContent$key = {
  readonly " $data"?: notificationsButtonContent$data;
  readonly " $fragmentSpreads": FragmentRefs<"notificationsButtonContent">;
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
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "343b3904fd7e7fcec0f7c8af11e29f8d";

export default node;
