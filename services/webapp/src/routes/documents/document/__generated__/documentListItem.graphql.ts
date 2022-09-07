/**
 * @generated SignedSource<<ce24d8aca776dcfbb32a8d44a3775e4f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type documentListItem$data = {
  readonly createdAt: String;
  readonly file: {
    readonly name: string | null;
    readonly url: string | null;
  } | null;
  readonly id: string;
  readonly " $fragmentType": "documentListItem";
};
export type documentListItem$key = {
  readonly " $data"?: documentListItem$data;
  readonly " $fragmentSpreads": FragmentRefs<"documentListItem">;
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

(node as any).hash = "78e0fbff7e74579c998ad7d7dc5b2400";

export default node;
