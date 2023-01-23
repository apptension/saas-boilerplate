/**
 * @generated SignedSource<<5f7a3db91c6eca48e203fb9326ed86f1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type demoItemListItem_item$data = {
  readonly image: {
    readonly title: string | null;
    readonly url: string | null;
  } | null;
  readonly title: string | null;
  readonly " $fragmentType": "demoItemListItem_item";
};
export type demoItemListItem_item$key = {
  readonly " $data"?: demoItemListItem_item$data;
  readonly " $fragmentSpreads": FragmentRefs<"demoItemListItem_item">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "demoItemListItem_item",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "Asset",
      "kind": "LinkedField",
      "name": "image",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "DemoItem",
  "abstractKey": null
};
})();

(node as any).hash = "f527f960aa9547599f7ba41c9fda9841";

export default node;
