/**
 * @generated SignedSource<<5a440af15f59fbe09f4b29812c4db2fb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type crudDemoItemListItem$data = {
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "crudDemoItemListItem";
};
export type crudDemoItemListItem$key = {
  readonly " $data"?: crudDemoItemListItem$data;
  readonly " $fragmentSpreads": FragmentRefs<"crudDemoItemListItem">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "crudDemoItemListItem",
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
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "CrudDemoItemType",
  "abstractKey": null
};

(node as any).hash = "8338f7e88136e1c383e623bdb919be6c";

export default node;
