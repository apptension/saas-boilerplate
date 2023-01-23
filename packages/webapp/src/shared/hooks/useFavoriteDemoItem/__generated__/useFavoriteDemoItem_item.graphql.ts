/**
 * @generated SignedSource<<213d78978e97535e7db6da86a4bbb54a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useFavoriteDemoItem_item$data = {
  readonly item: {
    readonly pk: string | null;
  };
  readonly " $fragmentType": "useFavoriteDemoItem_item";
};
export type useFavoriteDemoItem_item$key = {
  readonly " $data"?: useFavoriteDemoItem_item$data;
  readonly " $fragmentSpreads": FragmentRefs<"useFavoriteDemoItem_item">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFavoriteDemoItem_item",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ContentfulDemoItemType",
      "kind": "LinkedField",
      "name": "item",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "pk",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ContentfulDemoItemFavoriteType",
  "abstractKey": null
};

(node as any).hash = "e7bd18ebc31fb3b62bdc689263d4d71a";

export default node;
