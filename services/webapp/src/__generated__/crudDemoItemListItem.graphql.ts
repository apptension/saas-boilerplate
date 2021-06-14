/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type crudDemoItemListItem = {
    readonly id: string;
    readonly name: string;
    readonly " $refType": "crudDemoItemListItem";
};
export type crudDemoItemListItem$data = crudDemoItemListItem;
export type crudDemoItemListItem$key = {
    readonly " $data"?: crudDemoItemListItem$data;
    readonly " $fragmentRefs": FragmentRefs<"crudDemoItemListItem">;
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
(node as any).hash = '8338f7e88136e1c383e623bdb919be6c';
export default node;
