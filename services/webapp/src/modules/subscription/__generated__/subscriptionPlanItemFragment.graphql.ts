/**
 * @generated SignedSource<<38ae266ce4c6c5fe9f5c0f9ad65c6597>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type subscriptionPlanItemFragment$data = {
  readonly id: string;
  readonly pk: string | null;
  readonly product: {
    readonly id: string;
    readonly name: string;
  };
  readonly unitAmount: number | null;
  readonly " $fragmentType": "subscriptionPlanItemFragment";
};
export type subscriptionPlanItemFragment$key = {
  readonly " $data"?: subscriptionPlanItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"subscriptionPlanItemFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "subscriptionPlanItemFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pk",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "StripeProductType",
      "kind": "LinkedField",
      "name": "product",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
      "name": "unitAmount",
      "storageKey": null
    }
  ],
  "type": "SubscriptionPlanType",
  "abstractKey": null
};
})();

(node as any).hash = "0a3ac346e9b425c3b1cae57bb283eddd";

export default node;
