/**
 * @generated SignedSource<<21dca73e8785693eccfef92780a8a4a0>>
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
  "type": "ApiQuery",
  "abstractKey": null
};

(node as any).hash = "f339f8afc72f8403798b2e0e368e8e60";

export default node;
