/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type documentListItem = {
    readonly id: string;
    readonly file: {
        readonly url: string | null;
        readonly name: string | null;
    } | null;
    readonly createdAt: string;
    readonly " $refType": "documentListItem";
};
export type documentListItem$data = documentListItem;
export type documentListItem$key = {
    readonly " $data"?: documentListItem$data;
    readonly " $fragmentRefs": FragmentRefs<"documentListItem">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "documentListItem",
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
      "concreteType": "FileFieldType",
      "kind": "LinkedField",
      "name": "file",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
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
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    }
  ],
  "type": "DocumentDemoItemType",
  "abstractKey": null
};
(node as any).hash = '78e0fbff7e74579c998ad7d7dc5b2400';
export default node;
