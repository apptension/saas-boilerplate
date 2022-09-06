/**
 * @generated SignedSource<<2ecf047099127de34b07a98918c7ed06>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type commonQueryCurrentUserFragment$data = {
  readonly avatar: string | null;
  readonly email: string;
  readonly firstName: string | null;
  readonly id: string;
  readonly lastName: string | null;
  readonly roles: ReadonlyArray<string | null> | null;
  readonly " $fragmentType": "commonQueryCurrentUserFragment";
};
export type commonQueryCurrentUserFragment$key = {
  readonly " $data"?: commonQueryCurrentUserFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"commonQueryCurrentUserFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "commonQueryCurrentUserFragment",
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
      "name": "email",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "firstName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "roles",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "avatar",
      "storageKey": null
    }
  ],
  "type": "CurrentUserType",
  "abstractKey": null
};

(node as any).hash = "5e583fbd13ee225a80f6f718e3fa3f2e";

export default node;
